const { client } = require("../config/redisClient");
const logger = require("../config/logger");

const MAX_REQUESTS_PER_WINDOW = 50;
const WINDOW_SIZE_IN_SECONDS = 10;
const MAX_BULK_LOGINS = 10;

const complexRateLimitMiddleware = async (req, res, next) => {
  const apiKey = req.header("api-key");
  const ip = req.ip;
  const loginCount = Array.isArray(req.body.logins)
    ? req.body.logins.length
    : 1;

  if (loginCount > MAX_BULK_LOGINS) {
    return res.status(400).json({
      error: `Maximum of ${MAX_BULK_LOGINS} logins allowed per request`,
    });
  }

  try {
    const [apiKeyResult, ipResult] = await Promise.all([
      checkRateLimit(`rate_limit:${apiKey}`, loginCount),
      checkRateLimit(`rate_limit:${ip}`, loginCount),
    ]);

    const remaining = Math.min(apiKeyResult.remaining, ipResult.remaining);
    const resetTime = Math.max(apiKeyResult.resetTime, ipResult.resetTime);

    res.set({
      "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW,
      "X-RateLimit-Remaining": remaining,
      "X-RateLimit-Reset": resetTime,
    });

    if (remaining < 0) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    next();
  } catch (error) {
    logger.error("Error in rate limit middleware:", error);
    next(error);
  }
};

async function checkRateLimit(key, loginCount) {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE_IN_SECONDS * 1000;

  const multi = client.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  for (let i = 0; i < loginCount; i++) {
    multi.zadd(key, now, `${now}-${i}`);
  }
  multi.zrange(key, 0, -1);
  multi.expire(key, WINDOW_SIZE_IN_SECONDS);

  const results = await new Promise((resolve, reject) => {
    multi.exec((err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  const requestTimestamps = results[2];

  const requestsInWindow = requestTimestamps.length;
  const remaining = MAX_REQUESTS_PER_WINDOW - requestsInWindow;
  const oldestRequest = requestTimestamps[0] || now;
  const resetTime = Math.ceil((oldestRequest - windowStart) / 1000);

  return { remaining, resetTime };
}

module.exports = complexRateLimitMiddleware;

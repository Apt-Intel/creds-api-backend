const redis = require("redis");
const { promisify } = require("util");
const logger = require("../config/logger");

const redisClient = redis.createClient(process.env.REDIS_URL);
const incrAsync = promisify(redisClient.incr).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

const WINDOW_SIZE_IN_SECONDS = 10;
const MAX_REQUESTS_PER_WINDOW = 50;

const complexRateLimitMiddleware = async (req, res, next) => {
  const apiKey = req.header("api-key");
  const ip = req.ip;

  try {
    const [apiKeyRequests, ipRequests] = await Promise.all([
      incrementAndGetRequests(`rate_limit:${apiKey}`),
      incrementAndGetRequests(`rate_limit:${ip}`),
    ]);

    if (
      apiKeyRequests > MAX_REQUESTS_PER_WINDOW ||
      ipRequests > MAX_REQUESTS_PER_WINDOW
    ) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    next();
  } catch (error) {
    logger.error("Error in rate limit middleware:", error);
    next(error);
  }
};

async function incrementAndGetRequests(key) {
  const requests = await incrAsync(key);
  if (requests === 1) {
    await expireAsync(key, WINDOW_SIZE_IN_SECONDS);
  }
  return requests;
}

module.exports = complexRateLimitMiddleware;

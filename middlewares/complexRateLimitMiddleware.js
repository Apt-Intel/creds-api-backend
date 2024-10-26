const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { client: redisClient } = require("../config/redisClient");
const { getUsageStats } = require("../services/loggingService");

const complexRateLimitMiddleware = async (req, res, next) => {
  const apiKeyData = req.apiKeyData;
  const usageStats = await getUsageStats(apiKeyData.id);

  // Check daily limit
  if (
    apiKeyData.daily_limit &&
    usageStats.daily_requests >= apiKeyData.daily_limit
  ) {
    return res.status(429).json({ error: "Daily request limit exceeded" });
  }

  // Check monthly limit
  if (
    apiKeyData.monthly_limit &&
    usageStats.monthly_requests >= apiKeyData.monthly_limit
  ) {
    return res.status(429).json({ error: "Monthly request limit exceeded" });
  }

  // Apply per-minute rate limit
  const rateLimitValue = apiKeyData.rate_limit || 1000; // Default rate limit

  const limiter = rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: `rl:${apiKeyData.id}:`,
    }),
    max: rateLimitValue,
    windowMs: 60000, // 1 minute window
    message: "Too many requests, please try again later.",
  });

  return limiter(req, res, next);
};

module.exports = complexRateLimitMiddleware;

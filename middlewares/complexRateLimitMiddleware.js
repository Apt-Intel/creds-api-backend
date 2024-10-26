const rateLimit = require("express-rate-limit");
const Redis = require("ioredis");
const RedisStore = require("rate-limit-redis").default;
const { getUsageStats } = require("../services/loggingService");
const logger = require("../config/logger");

// Create a new Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  // Add any other necessary configuration options
});

const complexRateLimitMiddleware = async (req, res, next) => {
  try {
    const apiKeyData = req.apiKeyData;
    if (!apiKeyData) {
      logger.error("API key data is missing in the request");
      return res.status(500).json({ error: "Internal server error" });
    }

    logger.debug(`API Key Data: ${JSON.stringify(apiKeyData)}`);

    let usageStats;
    try {
      usageStats = await getUsageStats(apiKeyData.id);
      logger.debug(`Usage Stats: ${JSON.stringify(usageStats)}`);
    } catch (error) {
      logger.error(`Error fetching usage stats: ${error.message}`);
      // Proceed with default values if we can't get the stats
      usageStats = { daily_requests: 0, monthly_requests: 0 };
    }

    if (!usageStats) {
      logger.error("Usage stats are undefined after fetching");
      usageStats = { daily_requests: 0, monthly_requests: 0 };
    }

    // Check daily limit
    if (
      apiKeyData.daily_limit &&
      usageStats.daily_requests >= apiKeyData.daily_limit
    ) {
      logger.info(`Daily limit exceeded for API key: ${apiKeyData.id}`);
      return res.status(429).json({ error: "Daily request limit exceeded" });
    }

    // Check monthly limit
    if (
      apiKeyData.monthly_limit &&
      usageStats.monthly_requests >= apiKeyData.monthly_limit
    ) {
      logger.info(`Monthly limit exceeded for API key: ${apiKeyData.id}`);
      return res.status(429).json({ error: "Monthly request limit exceeded" });
    }

    // Apply per-minute rate limit
    const rateLimitValue = apiKeyData.rate_limit || 1000; // Default rate limit

    const limiter = rateLimit({
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: `rl:${apiKeyData.id}:`,
      }),
      max: rateLimitValue,
      windowMs: 60000, // 1 minute window
      message: "Too many requests, please try again later.",
    });

    return limiter(req, res, next);
  } catch (error) {
    logger.error(`Unexpected error in rate limit middleware: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = complexRateLimitMiddleware;

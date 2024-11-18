const { updateUsageStats } = require("../services/loggingService");
const logger = require("../config/logger");
const UsageLimitExceededError = require("../errors/UsageLimitExceededError");
const { USAGE_ENDPOINT } = require("../config/constants");

const complexRateLimitMiddleware = async (req, res, next) => {
  try {
    if (!req.apiKeyData || !req.apiKeyData.id) {
      logger.error("Missing API key data in rate limiter", {
        requestId: req.requestId,
      });
      return res
        .status(500)
        .json({ error: "API key data not properly initialized" });
    }

    const apiKey = req.apiKeyData.key;
    const ip = req.ip;

    // Exempt the usage endpoint from complex rate limiting
    if (req.path === USAGE_ENDPOINT) {
      return next();
    }

    try {
      await updateUsageStats(req);
      next();
    } catch (error) {
      if (error instanceof UsageLimitExceededError) {
        logger.warn(`Usage limits exceeded for API key: ${apiKey}`);
        res.set("Retry-After", error.retryAfter);
        return res.status(429).json({
          error: "Usage limit exceeded",
          message: `Your ${error.limitType} usage limit has been exceeded.`,
          retryAfter: error.retryAfter,
        });
      } else {
        logger.error(`Error updating usage stats: ${error.message}`);
        return res.status(500).json({
          error: "Internal server error",
          message: "An error occurred while updating usage statistics",
        });
      }
    }
  } catch (error) {
    logger.error("Error in rate limit middleware:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    next(error);
  }
};

function calculateRetryAfter(apiKeyData) {
  // Implement logic to calculate when the user can retry based on their limits
  // This is a placeholder implementation
  return 3600; // 1 hour
}

module.exports = complexRateLimitMiddleware;

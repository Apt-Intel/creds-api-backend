const { updateUsageStats } = require("../services/loggingService");
const logger = require("../config/logger");

const complexRateLimitMiddleware = async (req, res, next) => {
  try {
    const apiKeyData = req.apiKeyData;
    if (!apiKeyData) {
      logger.error("API key data is missing in the request");
      return res
        .status(500)
        .json({
          error: "Internal server error",
          message: "API key data is missing",
        });
    }

    try {
      await updateUsageStats(apiKeyData.id);
    } catch (error) {
      if (error.message === "Usage limits exceeded") {
        logger.warn(`Usage limits exceeded for API key: ${apiKeyData.id}`);
        const retryAfter = calculateRetryAfter(apiKeyData);
        res.set("Retry-After", retryAfter);
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Daily or monthly usage limit exceeded",
          retryAfter: retryAfter,
        });
      } else {
        throw error;
      }
    }

    next();
  } catch (error) {
    logger.error(
      `Unexpected error in complexRateLimitMiddleware: ${error.message}`
    );
    res
      .status(500)
      .json({
        error: "Internal server error",
        message: "An unexpected error occurred",
      });
  }
};

function calculateRetryAfter(apiKeyData) {
  // Implement logic to calculate when the user can retry based on their limits
  // This is a placeholder implementation
  return 3600; // 1 hour
}

module.exports = complexRateLimitMiddleware;

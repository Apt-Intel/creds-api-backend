const { promisify } = require("util");
const logger = require("../config/logger");

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header("api-key");
    logger.info(`Received API key: ${apiKey}`);

    if (!apiKey) {
      logger.warn("No API key provided");
      return res.status(401).json({ error: "API key is required" });
    }

    // Validate API key
    const isValid = apiKey === process.env.API_KEY;
    logger.info(`API key validation result: ${isValid}`);

    if (isValid) {
      // Cache the valid result for 1 hour (3600 seconds)
      await global.redisClient.setex(`api_key:${apiKey}`, 3600, "valid");
      logger.info("Valid API key cached");
      next();
    } else {
      // Cache the invalid result for a shorter time (e.g., 5 minutes)
      await global.redisClient.setex(`api_key:${apiKey}`, 300, "invalid");
      logger.warn("Invalid API key cached");
      res.status(401).json({ error: "Invalid API key" });
    }
  } catch (error) {
    logger.error("Error in auth middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authMiddleware;

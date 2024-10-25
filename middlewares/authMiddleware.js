const { ApiKey } = require("../models");
const logger = require("../config/logger");
const { asyncRedis } = require("../config/redisClient");
const { hashApiKey } = require("../utils/hashUtils");

const CACHE_TTL = 3600; // 1 hour in seconds

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header("api-key");
    if (!apiKey) {
      logger.warn("No API key provided");
      return res.status(401).json({ error: "API key is required" });
    }

    const hashedApiKey = hashApiKey(apiKey);
    logger.info(`Received API key: ${apiKey}, Hashed: ${hashedApiKey}`);

    // Check Redis cache first
    let apiKeyData = await asyncRedis.get(`api_key:${hashedApiKey}`);

    if (apiKeyData) {
      apiKeyData = JSON.parse(apiKeyData);
      logger.info("API key data retrieved from cache");
    } else {
      // If not in cache, fetch from database
      apiKeyData = await ApiKey.findOne({ where: { api_key: hashedApiKey } });

      if (!apiKeyData) {
        logger.warn(`API key not found in database: ${hashedApiKey}`);
        return res.status(401).json({ error: "Invalid API key" });
      }

      if (apiKeyData.status !== "active") {
        logger.warn(
          `Inactive API key: ${hashedApiKey}, Status: ${apiKeyData.status}`
        );
        return res.status(401).json({ error: "Inactive API key" });
      }

      // Cache the API key data
      await asyncRedis.setex(
        `api_key:${hashedApiKey}`,
        CACHE_TTL,
        JSON.stringify(apiKeyData.toJSON())
      );
      logger.info("API key data cached");
    }

    // Attach API key data to request object
    req.apiKeyData = apiKeyData;
    req.userId = apiKeyData.user_id;

    next();
  } catch (error) {
    logger.error("Error in authentication middleware:", error);
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({ error: "Service temporarily unavailable" });
    }
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message,
    });
  }
};

module.exports = authMiddleware;

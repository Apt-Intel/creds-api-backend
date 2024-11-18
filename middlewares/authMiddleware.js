const logger = require("../config/logger");
const { asyncRedis } = require("../config/redisClient");
const { getApiKeyDetails } = require("../services/apiKeyService");

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header("api-key");
    logger.info(`Received API key: ${apiKey}`);

    if (!apiKey) {
      logger.warn("No API key provided");
      return res.status(401).json({ error: "API key is required" });
    }

    // Get API key details including ID
    const apiKeyData = await getApiKeyDetails(apiKey);

    if (!apiKeyData) {
      logger.warn("Invalid API key");
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Store API key data in request object
    req.apiKeyData = {
      id: apiKeyData.id,
      key: apiKey,
      // Add other relevant data
    };

    logger.info("API key validated successfully", {
      apiKeyId: apiKeyData.id,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    logger.error("Error in auth middleware:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authMiddleware;

const { asyncRedis } = require("../config/redisClient");
const logger = require("../config/logger");

const invalidateApiKeyCache = async (apiKey) => {
  try {
    await asyncRedis.del(`api_key:${apiKey}`);
    logger.info(`Cache invalidated for API key: ${apiKey}`);
  } catch (error) {
    logger.error("Error invalidating API key cache:", error);
  }
};

module.exports = { invalidateApiKeyCache };

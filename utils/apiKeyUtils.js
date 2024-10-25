const crypto = require("crypto");
const { ApiKey } = require("../models");
const { hashApiKey } = require("./hashUtils");
const { invalidateApiKeyCache } = require("./cacheUtils");
const logger = require("../config/logger");

const generateApiKey = async (userId, metadata = {}) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const apiKey = crypto.randomBytes(32).toString("hex");
    const hashedApiKey = hashApiKey(apiKey);
    const newApiKey = await ApiKey.create({
      api_key: hashedApiKey,
      user_id: userId,
      status: "active",
      endpoints_allowed: ["all"],
      rate_limit: 1000,
      metadata,
    });
    logger.info(`Generated API key: ${apiKey}, Hashed: ${hashedApiKey}`);
    return {
      apiKey,
      hashedApiKey: newApiKey.api_key,
      userId: newApiKey.user_id,
    };
  } catch (error) {
    logger.error("Error generating API key:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("API key generation failed. Please try again.");
    }
    throw error;
  }
};

const updateApiKeyStatus = async (apiKey, status) => {
  try {
    const hashedApiKey = hashApiKey(apiKey);
    logger.info(`Updating API key status: ${hashedApiKey} to ${status}`);

    const existingApiKey = await ApiKey.findOne({
      where: { api_key: hashedApiKey },
    });
    if (!existingApiKey) {
      logger.warn(`No API key found with hash: ${hashedApiKey}`);
      throw new Error("API key not found");
    }

    existingApiKey.status = status;
    await existingApiKey.save();

    logger.info(`API key status updated successfully.`);

    await invalidateApiKeyCache(hashedApiKey);

    return existingApiKey;
  } catch (error) {
    logger.error("Error updating API key status:", error);
    throw error;
  }
};

module.exports = { generateApiKey, updateApiKeyStatus };

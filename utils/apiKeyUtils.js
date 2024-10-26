const crypto = require("crypto");
const { ApiKey } = require("../models");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ensure that your ApiKey model is properly defined to include `daily_limit` and `monthly_limit`.

async function generateApiKey(
  userId,
  metadata = {},
  endpointsAllowed = ["all"],
  rateLimit = 1000,
  dailyLimit = 0,
  monthlyLimit = 0
) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const apiKey = crypto.randomBytes(32).toString("hex");
    const hashedApiKey = hashApiKey(apiKey);

    // Ensure endpointsAllowed is an array of strings
    const sanitizedEndpoints = Array.isArray(endpointsAllowed)
      ? endpointsAllowed.map(String)
      : [String(endpointsAllowed)];

    const newApiKey = await ApiKey.create({
      user_id: userId,
      api_key: hashedApiKey,
      metadata,
      endpoints_allowed: sanitizedEndpoints,
      rate_limit: rateLimit,
      daily_limit: dailyLimit,
      monthly_limit: monthlyLimit,
    });

    logger.info(`Generated API key: ${apiKey}, Hashed: ${hashedApiKey}`);
    logger.info(`Endpoints allowed: ${JSON.stringify(sanitizedEndpoints)}`);
    logger.info(`Rate limit: ${rateLimit}`);
    logger.info(`Daily limit: ${dailyLimit}`);
    logger.info(`Monthly limit: ${monthlyLimit}`);

    return {
      apiKey,
      apiKeyData: newApiKey,
    };
  } catch (error) {
    logger.error("Error generating API key:", error);
    throw error;
  }
}

const updateApiKeyStatus = async (
  apiKey,
  status,
  endpointsAllowed,
  rateLimit
) => {
  try {
    const hashedApiKey = hashApiKey(apiKey);
    logger.info(`Updating API key: ${hashedApiKey}`);
    logger.info(`New status: ${status}`);
    logger.info(`New endpoints allowed: ${JSON.stringify(endpointsAllowed)}`);
    logger.info(`New rate limit: ${rateLimit}`);

    const existingApiKey = await ApiKey.findOne({
      where: { api_key: hashedApiKey },
    });
    if (!existingApiKey) {
      logger.warn(`No API key found with hash: ${hashedApiKey}`);
      throw new Error("API key not found");
    }

    existingApiKey.status = status;

    if (endpointsAllowed) {
      // Ensure endpointsAllowed is an array
      const endpointsArray = Array.isArray(endpointsAllowed)
        ? endpointsAllowed
        : [endpointsAllowed];

      // Remove duplicates and convert to lowercase
      const uniqueEndpoints = [
        ...new Set(endpointsArray.map((e) => e.toLowerCase())),
      ];

      // Check if "all" is present
      if (uniqueEndpoints.includes("all")) {
        existingApiKey.endpoints_allowed = ["all"];
      } else if (uniqueEndpoints.length === 0) {
        throw new Error("Endpoints allowed cannot be empty");
      } else {
        existingApiKey.endpoints_allowed = uniqueEndpoints;
      }
    }

    if (rateLimit) {
      existingApiKey.rate_limit = rateLimit;
    }

    await existingApiKey.save();

    logger.info(`API key updated successfully.`);
    logger.info(
      `Updated endpoints allowed: ${JSON.stringify(
        existingApiKey.endpoints_allowed
      )}`
    );
    logger.info(`Updated rate limit: ${existingApiKey.rate_limit}`);

    await invalidateApiKeyCache(hashedApiKey);

    return existingApiKey;
  } catch (error) {
    logger.error("Error updating API key:", error);
    throw error;
  }
};

module.exports = { generateApiKey, updateApiKeyStatus };

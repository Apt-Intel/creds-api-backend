const crypto = require("crypto");
const { ApiKey } = require("../models");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ensure that your ApiKey model is properly defined to include `daily_limit` and `monthly_limit`.

const generateApiKey = async (
  userId,
  metadata = {},
  endpointsAllowed = ["all"],
  rateLimit = 1000,
  dailyLimit = 0,
  monthlyLimit = 0
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const apiKey = crypto.randomBytes(32).toString("hex");
    const hashedApiKey = hashApiKey(apiKey);

    const result = await pool.query(
      `INSERT INTO api_keys
        (user_id, api_key, status, metadata, endpoints_allowed, rate_limit, daily_limit, monthly_limit)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        userId,
        hashedApiKey,
        "active",
        metadata,
        JSON.stringify(endpointsAllowed),
        rateLimit,
        dailyLimit,
        monthlyLimit,
      ]
    );

    const newApiKey = result.rows[0];

    logger.info(`Generated API key: ${apiKey}, Hashed: ${hashedApiKey}`);
    logger.info(`Endpoints allowed: ${JSON.stringify(endpointsAllowed)}`);
    logger.info(`Rate limit: ${rateLimit}`);
    logger.info(`Daily limit: ${dailyLimit}`);
    logger.info(`Monthly limit: ${monthlyLimit}`);

    return {
      apiKey,
      hashedApiKey,
      userId: newApiKey.user_id,
      endpointsAllowed: endpointsAllowed,
      rateLimit: newApiKey.rate_limit,
      dailyLimit: newApiKey.daily_limit,
      monthlyLimit: newApiKey.monthly_limit,
    };
  } catch (error) {
    logger.error("Error generating API key:", error);
    throw error;
  }
};

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

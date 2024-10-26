const { ApiKey } = require("../models");
const { asyncRedis } = require("../config/redisClient");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const API_KEY_CACHE_PREFIX = "api_key:";
const API_KEY_CACHE_TTL = 3600; // 1 hour

async function updateApiKeyStatus(
  apiKey,
  status,
  endpointsAllowed,
  rateLimit,
  dailyLimit,
  monthlyLimit
) {
  const hashedApiKey = hashApiKey(apiKey);
  const result = await pool.query(
    "UPDATE api_keys SET status = $1, endpoints_allowed = $2, rate_limit = $3, daily_limit = $4, monthly_limit = $5 WHERE api_key = $6 RETURNING *",
    [
      status,
      JSON.stringify(endpointsAllowed),
      rateLimit,
      dailyLimit,
      monthlyLimit,
      hashedApiKey,
    ]
  );

  if (result.rows.length === 0) {
    throw new Error("API key not found");
  }

  return result.rows[0];
}

async function getApiKeyDetails(apiKey) {
  const hashedApiKey = hashApiKey(apiKey);
  const cacheKey = `${API_KEY_CACHE_PREFIX}${hashedApiKey}`;

  try {
    // Try to get from cache first
    const cachedData = await asyncRedis.get(cacheKey);
    if (cachedData) {
      logger.info(`API key data retrieved from cache for key: ${hashedApiKey}`);
      return JSON.parse(cachedData);
    }

    // If not in cache, fetch from database
    const result = await pool.query(
      "SELECT * FROM api_keys WHERE api_key = $1",
      [hashedApiKey]
    );
    const apiKeyData = result.rows[0];
    if (!apiKeyData) {
      logger.warn(`API key not found in database: ${hashedApiKey}`);
      return null;
    }

    logger.info(`API key data fetched from database for key: ${hashedApiKey}`);

    // Parse endpoints_allowed if necessary
    if (typeof apiKeyData.endpoints_allowed === "string") {
      apiKeyData.endpoints_allowed = JSON.parse(apiKeyData.endpoints_allowed);
    }

    // Cache the API key data
    await asyncRedis.setex(
      cacheKey,
      API_KEY_CACHE_TTL,
      JSON.stringify(apiKeyData)
    );
    logger.info(`API key data cached for key: ${hashedApiKey}`);

    return apiKeyData;
  } catch (error) {
    logger.error(
      `Error fetching API key details for key ${hashedApiKey}:`,
      error
    );
    throw new Error(`Failed to retrieve API key details: ${error.message}`);
  }
}

module.exports = {
  getApiKeyDetails,
  updateApiKeyStatus,
};

const crypto = require("crypto");
const { ApiKey } = require("../models");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");
const { ALWAYS_ALLOWED_ENDPOINTS } = require("../config/constants");

async function generateApiKey(
  userId,
  metadata = {},
  endpointsAllowed = ["all"],
  rateLimit = 1000,
  dailyLimit = 50, // Change default to 100
  monthlyLimit = 150, // Change default to 200
  timezone = process.env.DEFAULT_TIMEZONE || "UTC"
) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  try {
    const apiKey = crypto.randomBytes(32).toString("hex");
    const hashedApiKey = hashApiKey(apiKey);

    // Ensure endpointsAllowed is an array of strings and includes ALWAYS_ALLOWED_ENDPOINTS
    const sanitizedEndpoints = Array.isArray(endpointsAllowed)
      ? [
          ...new Set([
            ...endpointsAllowed.map(String),
            ...ALWAYS_ALLOWED_ENDPOINTS,
          ]),
        ]
      : [...new Set([String(endpointsAllowed), ...ALWAYS_ALLOWED_ENDPOINTS])];

    const newApiKey = await ApiKey.create({
      user_id: userId,
      api_key: hashedApiKey,
      status: "active", // Set a default status
      metadata,
      endpoints_allowed: sanitizedEndpoints,
      rate_limit: rateLimit,
      daily_limit: dailyLimit,
      monthly_limit: monthlyLimit,
      timezone,
      last_reset_date: new Date(), // Set the initial reset date
    });

    logger.info(`Generated API key: ${apiKey}, Hashed: ${hashedApiKey}`);
    logger.info(`Endpoints allowed: ${JSON.stringify(sanitizedEndpoints)}`);
    logger.info(`Rate limit: ${rateLimit}`);
    logger.info(`Daily limit: ${dailyLimit}`);
    logger.info(`Monthly limit: ${monthlyLimit}`);
    logger.info(`Timezone: ${timezone}`);

    return {
      apiKey,
      apiKeyData: newApiKey,
    };
  } catch (error) {
    logger.error("Error generating API key:", error);
    throw error;
  }
}

const updateApiKeyDetails = async (
  apiKey,
  {
    status,
    userId,
    endpointsAllowed,
    rateLimit,
    dailyLimit,
    monthlyLimit,
    metadata,
    timezone,
  }
) => {
  try {
    const hashedApiKey = hashApiKey(apiKey);
    logger.info(`Updating API key: ${hashedApiKey}`);

    const existingApiKey = await ApiKey.findOne({
      where: { api_key: hashedApiKey },
    });
    if (!existingApiKey) {
      logger.warn(`No API key found with hash: ${hashedApiKey}`);
      throw new Error("API key not found");
    }

    // Update fields if provided
    if (status) existingApiKey.status = status;
    if (userId) existingApiKey.user_id = userId;
    if (rateLimit !== undefined) existingApiKey.rate_limit = rateLimit;
    if (dailyLimit !== undefined) existingApiKey.daily_limit = dailyLimit;
    if (monthlyLimit !== undefined) existingApiKey.monthly_limit = monthlyLimit;
    if (metadata)
      existingApiKey.metadata = { ...existingApiKey.metadata, ...metadata };
    if (timezone) existingApiKey.timezone = timezone;

    if (endpointsAllowed) {
      const uniqueEndpoints = [
        ...new Set([
          ...endpointsAllowed.map((e) => e.toLowerCase()),
          ...ALWAYS_ALLOWED_ENDPOINTS,
        ]),
      ];

      existingApiKey.endpoints_allowed = uniqueEndpoints.includes("all")
        ? ["all"]
        : uniqueEndpoints;
    }

    existingApiKey.updated_at = new Date();

    await existingApiKey.save();

    logger.info(`API key updated successfully.`);
    return existingApiKey;
  } catch (error) {
    logger.error("Error updating API key:", error);
    throw error;
  }
};

module.exports = { generateApiKey, updateApiKeyDetails };

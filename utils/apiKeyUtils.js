const crypto = require("crypto");
const { ApiKey } = require("../models");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");

async function generateApiKey(
  userId,
  metadata = {},
  endpointsAllowed = ["all"],
  rateLimit = 1000,
  dailyLimit = 0,
  monthlyLimit = 0,
  timezone = process.env.DEFAULT_TIMEZONE || "UTC"
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

const updateApiKeyStatus = async (
  apiKey,
  status,
  endpointsAllowed,
  rateLimit,
  dailyLimit,
  monthlyLimit,
  timezone
) => {
  try {
    const hashedApiKey = hashApiKey(apiKey);
    logger.info(`Updating API key: ${hashedApiKey}`);
    logger.info(`New status: ${status}`);
    logger.info(`New endpoints allowed: ${JSON.stringify(endpointsAllowed)}`);
    logger.info(`New rate limit: ${rateLimit}`);
    logger.info(`New daily limit: ${dailyLimit}`);
    logger.info(`New monthly limit: ${monthlyLimit}`);
    logger.info(`New timezone: ${timezone}`);

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

    if (rateLimit !== undefined) existingApiKey.rate_limit = rateLimit;
    if (dailyLimit !== undefined) existingApiKey.daily_limit = dailyLimit;
    if (monthlyLimit !== undefined) existingApiKey.monthly_limit = monthlyLimit;
    if (timezone !== undefined) existingApiKey.timezone = timezone;

    existingApiKey.updated_at = new Date();

    await existingApiKey.save();

    logger.info(`API key updated successfully.`);
    logger.info(
      `Updated endpoints allowed: ${JSON.stringify(
        existingApiKey.endpoints_allowed
      )}`
    );
    logger.info(`Updated rate limit: ${existingApiKey.rate_limit}`);
    logger.info(`Updated daily limit: ${existingApiKey.daily_limit}`);
    logger.info(`Updated monthly limit: ${existingApiKey.monthly_limit}`);
    logger.info(`Updated timezone: ${existingApiKey.timezone}`);

    return existingApiKey;
  } catch (error) {
    logger.error("Error updating API key:", error);
    throw error;
  }
};

module.exports = { generateApiKey, updateApiKeyStatus };

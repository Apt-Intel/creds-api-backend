const { ApiKey } = require("../models");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");

async function getApiKeyDetails(apiKey) {
  const hashedApiKey = hashApiKey(apiKey);
  const apiKeyData = await ApiKey.findOne({ where: { api_key: hashedApiKey } });

  if (apiKeyData) {
    return {
      id: apiKeyData.id,
      status: apiKeyData.status,
      userId: apiKeyData.user_id,
      hashedApiKey: apiKeyData.api_key,
      endpointsAllowed: apiKeyData.endpoints_allowed,
      rateLimit: apiKeyData.rate_limit,
      dailyLimit: apiKeyData.daily_limit,
      monthlyLimit: apiKeyData.monthly_limit,
      metadata: apiKeyData.metadata,
      timezone: apiKeyData.timezone, // Include the timezone
    };
  }
  return null;
}

async function updateApiKeyLimits(
  apiKeyId,
  dailyLimit,
  monthlyLimit,
  timezone
) {
  const apiKeyRecord = await ApiKey.findByPk(apiKeyId);
  if (!apiKeyRecord) {
    throw new Error("API key not found");
  }

  await apiKeyRecord.update({
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
    timezone: timezone, // Include timezone in the update
  });

  return apiKeyRecord;
}

async function getApiKeyWithLimits(apiKeyId) {
  return await ApiKey.findByPk(apiKeyId);
}

module.exports = {
  getApiKeyDetails,
  updateApiKeyLimits,
  getApiKeyWithLimits,
};

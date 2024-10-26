const { ApiKey } = require("../models");
const { hashApiKey } = require("../utils/hashUtils");
const logger = require("../config/logger");

async function getApiKeyDetails(apiKey) {
  const hashedApiKey = hashApiKey(apiKey);
  return await ApiKey.findOne({ where: { api_key: hashedApiKey } });
}

async function updateApiKeyStatus(
  apiKey,
  status,
  endpointsAllowed,
  rateLimit,
  dailyLimit,
  monthlyLimit
) {
  const hashedApiKey = hashApiKey(apiKey);
  const apiKeyRecord = await ApiKey.findOne({
    where: { api_key: hashedApiKey },
  });

  if (!apiKeyRecord) {
    throw new Error("API key not found");
  }

  await apiKeyRecord.update({
    status,
    endpoints_allowed: endpointsAllowed,
    rate_limit: rateLimit,
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
  });

  return apiKeyRecord;
}

async function updateApiKeyLimits(apiKeyId, dailyLimit, monthlyLimit) {
  const apiKeyRecord = await ApiKey.findByPk(apiKeyId);
  if (!apiKeyRecord) {
    throw new Error("API key not found");
  }

  await apiKeyRecord.update({
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
  });

  return apiKeyRecord;
}

async function getApiKeyWithLimits(apiKeyId) {
  return await ApiKey.findByPk(apiKeyId);
}

module.exports = {
  getApiKeyDetails,
  updateApiKeyStatus,
  updateApiKeyLimits,
  getApiKeyWithLimits,
};

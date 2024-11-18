const { sequelize } = require("../config/sequelize");
const { ApiKey, ApiUsage, ApiRequestLog } = require("../models");
const logger = require("../config/logger");
const UsageLimitExceededError = require("../errors/UsageLimitExceededError");

const logQueue = [];
let isProcessing = false;

async function processLogQueue() {
  if (isProcessing || logQueue.length === 0) return;

  isProcessing = true;
  const logsToInsert = logQueue.splice(0, logQueue.length);

  const transaction = await sequelize.transaction();

  try {
    await ApiRequestLog.bulkCreate(logsToInsert, { transaction });
    logger.info(`Inserted ${logsToInsert.length} logs into api_requests_log`);

    await transaction.commit();
    logger.info("Successfully processed log queue");
  } catch (error) {
    await transaction.rollback();
    logger.error("Error processing log queue:", error);
  } finally {
    isProcessing = false;
  }
}

setInterval(processLogQueue, 5000); // Process every 5 seconds

function logRequest(logData) {
  return new Promise((resolve, reject) => {
    try {
      logQueue.push(logData);
      logger.debug(
        `Added request to log queue for API key ${logData.apiKeyId}`
      );
      resolve();
    } catch (error) {
      logger.error(`Error adding request to log queue: ${error.message}`);
      reject(error);
    }
  });
}

async function updateUsageStats(req) {
  try {
    if (!req.apiKeyData || !req.apiKeyData.id) {
      logger.error("Missing API key data for usage tracking", {
        requestId: req.requestId,
        apiKeyData: req.apiKeyData,
      });
      return;
    }

    const apiKeyId = req.apiKeyData.id;

    // Find or create usage record
    const [usage, created] = await ApiUsage.findOrCreate({
      where: { api_key_id: apiKeyId },
      defaults: {
        api_key_id: apiKeyId,
        daily_requests: 1,
        monthly_requests: 1,
        total_requests: 1,
        last_request_date: new Date(),
      },
    });

    if (!created) {
      // Update existing record
      await usage.increment({
        daily_requests: 1,
        monthly_requests: 1,
        total_requests: 1,
      });
      await usage.update({
        last_request_date: new Date(),
      });
    }

    logger.info("Usage stats updated successfully", {
      apiKeyId,
      requestId: req.requestId,
    });
  } catch (error) {
    logger.error("Error updating usage stats:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
      apiKeyId: req.apiKeyData?.id,
    });
  }
}

function calculateRetryAfter(limitType) {
  const now = new Date();
  if (limitType === "daily") {
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return Math.ceil((midnight - now) / 1000);
  } else if (limitType === "monthly") {
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((firstOfNextMonth - now) / 1000);
  }
  return 3600; // Default to 1 hour
}

async function getUsageStats(apiKeyId) {
  try {
    // Ensure the ApiUsage record exists
    let apiUsage = await ApiUsage.findOne({ where: { api_key_id: apiKeyId } });

    if (!apiUsage) {
      apiUsage = await ApiUsage.create({
        api_key_id: apiKeyId,
        total_requests: 0,
        daily_requests: 0,
        monthly_requests: 0,
        last_request_date: new Date(),
      });
    }

    const apiKey = await ApiKey.findByPk(apiKeyId);

    if (!apiKey) {
      logger.warn(`No API key found for ${apiKeyId}`);
      return null;
    }

    const stats = {
      daily_requests: apiUsage.daily_requests,
      monthly_requests: apiUsage.monthly_requests,
      total_requests: apiUsage.total_requests,
      daily_limit: apiKey.daily_limit,
      monthly_limit: apiKey.monthly_limit,
      last_request_date: apiUsage.last_request_date,
      timezone: apiKey.timezone,
      status: apiKey.status,
    };

    // Calculate remaining requests
    stats.remaining_daily_requests =
      stats.daily_limit > 0
        ? Math.max(0, stats.daily_limit - stats.daily_requests)
        : "Unlimited";
    stats.remaining_monthly_requests =
      stats.monthly_limit > 0
        ? Math.max(0, stats.monthly_limit - stats.monthly_requests)
        : "Unlimited";

    logger.info(`Retrieved usage stats for API key ${apiKeyId}`, stats);

    return stats;
  } catch (error) {
    logger.error(`Error getting usage stats for API key ${apiKeyId}`, {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

module.exports = { logRequest, updateUsageStats, getUsageStats };

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

async function updateUsageStats(apiKeyId) {
  const transaction = await sequelize.transaction();
  try {
    const [results] = await sequelize.query(
      "SELECT * FROM reset_and_update_usage(:apiKeyId)",
      {
        replacements: { apiKeyId },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (!results) {
      logger.error(
        `No results returned from reset_and_update_usage for API key: ${apiKeyId}`
      );
      throw new Error("Failed to update usage stats");
    }

    logger.info(`Usage stats update results: ${JSON.stringify(results)}`);

    const apiKey = await ApiKey.findByPk(apiKeyId, { transaction });
    if (!apiKey) {
      throw new Error("API key not found");
    }

    const { daily_limit, monthly_limit } = apiKey;
    const { updated_daily_requests, updated_monthly_requests } = results;

    if (
      updated_daily_requests === undefined ||
      updated_monthly_requests === undefined
    ) {
      logger.error(
        `Invalid results from reset_and_update_usage: ${JSON.stringify(
          results
        )}`
      );
      throw new Error("Invalid usage stats update results");
    }

    if (daily_limit && updated_daily_requests > daily_limit) {
      throw new UsageLimitExceededError("daily", calculateRetryAfter("daily"));
    }

    if (monthly_limit && updated_monthly_requests > monthly_limit) {
      throw new UsageLimitExceededError(
        "monthly",
        calculateRetryAfter("monthly")
      );
    }

    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error in updateUsageStats: ${error.message}`);
    throw error;
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
    const apiKey = await ApiKey.findByPk(apiKeyId, {
      include: [{ model: ApiUsage, as: "usage" }],
    });

    if (!apiKey) {
      logger.warn(`No API key found for ${apiKeyId}`, {
        apiKeyId,
        timestamp: new Date().toISOString(),
        event: "api_key_not_found",
      });
      return null;
    }

    const stats = {
      daily_requests: apiKey.usage ? apiKey.usage.daily_requests : 0,
      monthly_requests: apiKey.usage ? apiKey.usage.monthly_requests : 0,
      total_requests: apiKey.usage ? apiKey.usage.total_requests : 0,
      daily_limit: apiKey.daily_limit,
      monthly_limit: apiKey.monthly_limit,
      last_request_date: apiKey.usage ? apiKey.usage.last_request_date : null,
      timezone: apiKey.timezone, // Add this line
    };

    logger.info(`Retrieved usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      ...stats,
      event: "usage_stats_retrieved",
    });

    return stats;
  } catch (error) {
    logger.error(`Error getting usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      event: "usage_stats_retrieval_error",
    });
    throw error;
  }
}

module.exports = { logRequest, updateUsageStats, getUsageStats };

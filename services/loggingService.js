const { sequelize } = require("../config/sequelize");
const { ApiKey, ApiUsage, ApiRequestLog } = require("../models");
const logger = require("../config/logger");

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
    const apiKey = await ApiKey.findByPk(apiKeyId, { transaction });
    if (!apiKey) {
      throw new Error("API key not found");
    }

    const { daily_limit, monthly_limit } = apiKey;

    let usage = await ApiUsage.findOne({
      where: { api_key_id: apiKeyId },
      transaction,
    });

    if (!usage) {
      usage = await ApiUsage.create(
        {
          api_key_id: apiKeyId,
          total_requests: 1,
          daily_requests: 1,
          monthly_requests: 1,
          last_request_date: new Date(),
        },
        { transaction }
      );
    } else {
      await usage.update(
        {
          total_requests: sequelize.literal("total_requests + 1"),
          daily_requests: sequelize.literal(`
            CASE
              WHEN last_request_date = CURRENT_DATE THEN daily_requests + 1
              ELSE 1
            END
          `),
          monthly_requests: sequelize.literal(`
            CASE
              WHEN DATE_TRUNC('month', last_request_date) = DATE_TRUNC('month', CURRENT_DATE) THEN monthly_requests + 1
              ELSE 1
            END
          `),
          last_request_date: new Date(),
        },
        { transaction }
      );

      await usage.reload({ transaction });
    }

    if (
      (daily_limit !== null && usage.daily_requests > daily_limit) ||
      (monthly_limit !== null && usage.monthly_requests > monthly_limit)
    ) {
      logger.warn(`Usage limits exceeded for API key ${apiKeyId}`, {
        apiKeyId,
        timestamp: new Date().toISOString(),
        event: "usage_limit_exceeded",
      });
      await transaction.rollback();
      throw new Error("Usage limits exceeded");
    }

    await transaction.commit();

    logger.info(`Updated usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      daily_requests: usage.daily_requests,
      monthly_requests: usage.monthly_requests,
      daily_limit,
      monthly_limit,
      event: "usage_stats_updated",
    });

    return {
      daily_requests: usage.daily_requests,
      monthly_requests: usage.monthly_requests,
      daily_limit,
      monthly_limit,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error updating usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      event: "usage_stats_update_error",
    });
    throw error;
  }
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

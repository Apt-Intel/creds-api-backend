const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const logger = require("../config/logger");

const logQueue = [];
let isProcessing = false;

async function processLogQueue() {
  if (isProcessing || logQueue.length === 0) return;

  isProcessing = true;
  const logsToInsert = logQueue.splice(0, logQueue.length);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Batch insert logs
    const logInsertQuery = `
      INSERT INTO api_requests_log 
      (api_key_id, timestamp, endpoint, method, status_code, response_time_ms, ip_address, user_agent)
      SELECT * FROM UNNEST ($1::uuid[], $2::timestamp[], $3::text[], $4::text[], $5::integer[], $6::integer[], $7::text[], $8::text[])
    `;
    const logValues = logsToInsert.reduce(
      (acc, log) => {
        acc[0].push(log.apiKeyId);
        acc[1].push(log.timestamp);
        acc[2].push(log.endpoint);
        acc[3].push(log.method);
        acc[4].push(log.statusCode);
        acc[5].push(log.responseTimeMs);
        acc[6].push(log.ipAddress);
        acc[7].push(log.userAgent);
        return acc;
      },
      [[], [], [], [], [], [], [], []]
    );
    await client.query(logInsertQuery, logValues);
    logger.info(`Inserted ${logsToInsert.length} logs into api_requests_log`);

    await client.query("COMMIT");
    logger.info("Successfully processed log queue");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Error processing log queue:", error);
  } finally {
    client.release();
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
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      UPDATE api_usage
      SET
        total_requests = total_requests + 1,
        daily_requests = CASE
          WHEN last_request_date = CURRENT_DATE THEN daily_requests + 1
          ELSE 1
        END,
        monthly_requests = CASE
          WHEN DATE_TRUNC('month', last_request_date) = DATE_TRUNC('month', CURRENT_DATE) THEN monthly_requests + 1
          ELSE 1
        END,
        last_request_date = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
      WHERE api_key_id = $1
        AND (
          (daily_limit IS NULL OR daily_requests < daily_limit)
          AND (monthly_limit IS NULL OR monthly_requests < monthly_limit)
        )
      RETURNING daily_requests, monthly_requests, daily_limit, monthly_limit;
      `,
      [apiKeyId]
    );

    if (result.rows.length === 0) {
      logger.warn(`Usage limits exceeded for API key ${apiKeyId}`, {
        apiKeyId,
        timestamp: new Date().toISOString(),
        event: "usage_limit_exceeded",
      });
      throw new Error("Usage limits exceeded");
    }

    const { daily_requests, monthly_requests, daily_limit, monthly_limit } =
      result.rows[0];
    logger.info(`Updated usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      daily_requests,
      monthly_requests,
      daily_limit,
      monthly_limit,
      event: "usage_stats_updated",
    });
    return result.rows[0];
  } catch (error) {
    logger.error(`Error updating usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      error: error.message,
      event: "usage_stats_update_error",
    });
    throw error;
  } finally {
    client.release();
  }
}

async function getUsageStats(apiKeyId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT daily_requests, monthly_requests, daily_limit, monthly_limit FROM api_usage WHERE api_key_id = $1",
      [apiKeyId]
    );
    if (result.rows.length > 0) {
      logger.info(`Retrieved usage stats for API key ${apiKeyId}`, {
        apiKeyId,
        timestamp: new Date().toISOString(),
        ...result.rows[0],
        event: "usage_stats_retrieved",
      });
      return result.rows[0];
    } else {
      logger.warn(`No usage stats found for API key ${apiKeyId}`, {
        apiKeyId,
        timestamp: new Date().toISOString(),
        event: "usage_stats_not_found",
      });
      return {
        daily_requests: 0,
        monthly_requests: 0,
        daily_limit: null,
        monthly_limit: null,
      };
    }
  } catch (error) {
    logger.error(`Error getting usage stats for API key ${apiKeyId}`, {
      apiKeyId,
      timestamp: new Date().toISOString(),
      error: error.message,
      event: "usage_stats_retrieval_error",
    });
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { logRequest, updateUsageStats, getUsageStats };

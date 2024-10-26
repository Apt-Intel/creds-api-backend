const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
      VALUES ${logsToInsert
        .map(
          (_, i) =>
            `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${
              i * 8 + 5
            }, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
        )
        .join(",")}
    `;
    const logValues = logsToInsert.flatMap((log) => [
      log.apiKeyId,
      log.timestamp,
      log.endpoint,
      log.method,
      log.statusCode,
      log.responseTimeMs,
      log.ipAddress,
      log.userAgent,
    ]);
    await client.query(logInsertQuery, logValues);

    // Update usage stats
    for (const log of logsToInsert) {
      await client.query(
        `
        INSERT INTO api_usage (api_key_id, total_requests, daily_requests, monthly_requests, last_request_date)
        VALUES ($1, 1, 1, 1, CURRENT_DATE)
        ON CONFLICT (api_key_id) DO UPDATE SET
          total_requests = api_usage.total_requests + 1,
          daily_requests = CASE
            WHEN api_usage.last_request_date = CURRENT_DATE THEN api_usage.daily_requests + 1
            ELSE 1
          END,
          monthly_requests = CASE
            WHEN DATE_TRUNC('month', api_usage.last_request_date) = DATE_TRUNC('month', CURRENT_DATE) THEN api_usage.monthly_requests + 1
            ELSE 1
          END,
          last_request_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      `,
        [log.apiKeyId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error processing log queue:", error);
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
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function updateUsageStats(apiKeyId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [usage, created] = await ApiUsage.findOrCreate({
    where: { api_key_id: apiKeyId },
    defaults: {
      total_requests: 1,
      daily_requests: 1,
      monthly_requests: 1,
      last_request_date: now,
    },
  });

  if (!created) {
    await usage.increment("total_requests");
    if (usage.last_request_date < startOfDay) {
      await usage.update({ daily_requests: 1 });
    } else {
      await usage.increment("daily_requests");
    }
    if (usage.last_request_date < startOfMonth) {
      await usage.update({ monthly_requests: 1 });
    } else {
      await usage.increment("monthly_requests");
    }
    await usage.update({ last_request_date: now });
  }
}

async function getUsageStats(apiKeyId) {
  const usage = await ApiUsage.findOne({ where: { api_key_id: apiKeyId } });
  return usage
    ? {
        total_requests: usage.total_requests,
        daily_requests: usage.daily_requests,
        monthly_requests: usage.monthly_requests,
      }
    : {
        total_requests: 0,
        daily_requests: 0,
        monthly_requests: 0,
      };
}

module.exports = { logRequest, updateUsageStats, getUsageStats };

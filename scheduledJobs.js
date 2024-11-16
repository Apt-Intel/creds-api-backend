const cron = require("node-cron");
const { sequelize } = require("./config/sequelize");
const logger = require("./config/logger");
const moment = require("moment-timezone");
const { checkPostgresConnection } = require("./utils/databaseHealth");

let cronJob;

async function resetUsageForTimezone(timezone) {
  const now = moment().tz(timezone);
  const isFirstOfMonth = now.date() === 1;

  try {
    await Promise.race([
      sequelize.transaction(async (t) => {
        // Daily reset
        await sequelize.query(
          `
          UPDATE api_usage au
          SET daily_requests = 0
          FROM api_keys ak
          WHERE au.api_key_id = ak.id
            AND ak.timezone = :timezone
            AND au.last_request_date < :currentDate
        `,
          {
            replacements: { timezone, currentDate: now.format("YYYY-MM-DD") },
            transaction: t,
            timeout: 30000, // 30 second timeout
          }
        );

        // Monthly reset if needed
        if (isFirstOfMonth) {
          await sequelize.query(
            `
            UPDATE api_usage au
            SET monthly_requests = 0
            FROM api_keys ak
            WHERE au.api_key_id = ak.id
              AND ak.timezone = :timezone
              AND DATE_TRUNC('month', au.last_request_date) < DATE_TRUNC('month', :currentDate::DATE)
          `,
            {
              replacements: { timezone, currentDate: now.format("YYYY-MM-DD") },
              transaction: t,
              timeout: 30000,
            }
          );
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 35000)
      ),
    ]);

    logger.info(`Usage reset completed for timezone: ${timezone}`);
  } catch (error) {
    logger.error(`Error resetting usage for timezone ${timezone}:`, error);
  }
}

async function processBatchedTimezones(timezones, batchSize = 5) {
  for (let i = 0; i < timezones.length; i += batchSize) {
    const batch = timezones.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async ({ timezone }) => {
        try {
          await resetUsageForTimezone(timezone);
        } catch (error) {
          logger.error(`Error processing timezone ${timezone}:`, error);
        }
      })
    );
    // Delay between batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

function initializeScheduledJobs() {
  cronJob = cron.schedule("0 * * * *", async () => {
    if (!(await checkPostgresConnection())) {
      logger.error("Skipping usage reset due to PostgreSQL connection issues");
      return;
    }

    try {
      const [timezones] = await sequelize.query(
        "SELECT DISTINCT timezone FROM api_keys",
        { timeout: 5000 }
      );

      await processBatchedTimezones(timezones);
    } catch (error) {
      logger.error("Error in scheduled usage reset:", error);
    }
  });

  return cronJob;
}

function shutdownScheduledJobs() {
  if (cronJob) {
    cronJob.stop();
  }
}

module.exports = {
  initializeScheduledJobs,
  shutdownScheduledJobs,
};

const cron = require("node-cron");
const { sequelize } = require("./config/sequelize");
const logger = require("./config/logger");
const moment = require("moment-timezone");
const { checkPostgresConnection } = require("./utils/databaseHealth");
const { Op } = require("sequelize");
const { ApiUsage } = require("./models");

let cronJob;

async function resetUsageForTimezone(timezone) {
  const transaction = await sequelize.transaction();
  try {
    // Get the current date in the specified timezone
    const currentDate = moment().tz(timezone).format("YYYY-MM-DD");

    // Reset daily usage where last reset date is before today
    await ApiUsage.update(
      {
        daily_requests: 0,
        last_request_date: new Date(),
      },
      {
        where: {
          last_request_date: {
            [Op.lt]: currentDate,
          },
        },
        transaction,
      }
    );

    // Commit the transaction
    await transaction.commit();
  } catch (error) {
    logger.error("Error in scheduled usage reset:", error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
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

const cron = require("node-cron");
const { sequelize } = require("./config/sequelize");
const logger = require("./config/logger");
const moment = require("moment-timezone");

// Function to reset usage for a specific timezone
async function resetUsageForTimezone(timezone) {
  const now = moment().tz(timezone);
  const isFirstOfMonth = now.date() === 1;

  try {
    await sequelize.transaction(async (t) => {
      // Reset daily usage
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
        }
      );

      // Reset monthly usage if it's the first of the month
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
          }
        );
      }
    });

    logger.info(`Usage reset completed for timezone: ${timezone}`);
  } catch (error) {
    logger.error(`Error resetting usage for timezone ${timezone}:`, error);
  }
}

// Schedule job to run every hour
cron.schedule("0 * * * *", async () => {
  try {
    // Get all unique timezones from api_keys
    const [timezones] = await sequelize.query(
      "SELECT DISTINCT timezone FROM api_keys"
    );

    // Reset usage for each timezone
    for (const { timezone } of timezones) {
      await resetUsageForTimezone(timezone);
    }
  } catch (error) {
    logger.error("Error in scheduled usage reset:", error);
  }
});

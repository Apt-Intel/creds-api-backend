const { Sequelize } = require("sequelize");
const logger = require("./logger");

const config = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: (msg) => logger.debug(msg),
    timezone: process.env.DEFAULT_TIMEZONE || "UTC",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: "postgres",
    logging: false,
    timezone: process.env.DEFAULT_TIMEZONE || "UTC",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    timezone: process.env.DEFAULT_TIMEZONE || "UTC",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

const env = process.env.NODE_ENV || "development";

if (!config[env]) {
  throw new Error(`Invalid NODE_ENV: ${env}`);
}

if (!config[env].url) {
  throw new Error(`DATABASE_URL is not defined for ${env} environment`);
}

const sequelize = new Sequelize(config[env].url, config[env]);

// Initialize database connection
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info("Connected to PostgreSQL database");
  } catch (error) {
    logger.error("Unable to connect to PostgreSQL database:", error);
    throw error;
  }
}

// Initialize the database connection
initializeDatabase().catch((error) => {
  logger.error("Failed to initialize database:", error);
});

// Handle process termination
process.on("SIGINT", async () => {
  try {
    await sequelize.close();
    logger.info("Sequelize connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error closing Sequelize connection:", error);
    process.exit(1);
  }
});

module.exports = { sequelize, Sequelize };

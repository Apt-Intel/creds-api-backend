const { Sequelize } = require("sequelize");
const logger = require("./logger");

const config = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: (msg) => logger.debug(msg),
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: "postgres",
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
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

module.exports = { sequelize, Sequelize };
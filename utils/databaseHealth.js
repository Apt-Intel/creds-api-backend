const { sequelize } = require("../config/sequelize");
const mongoose = require("mongoose");
const logger = require("../config/logger");

async function checkPostgresConnection() {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    logger.error("PostgreSQL connection error:", error);
    return false;
  }
}

async function checkMongoConnection() {
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    return false;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    return false;
  }
}

async function checkAllDatabaseConnections() {
  const [postgresOk, mongoOk] = await Promise.all([
    checkPostgresConnection(),
    checkMongoConnection(),
  ]);

  return {
    postgres: postgresOk,
    mongo: mongoOk,
    allHealthy: postgresOk && mongoOk,
  };
}

module.exports = {
  checkPostgresConnection,
  checkMongoConnection,
  checkAllDatabaseConnections,
};

const mongoose = require("mongoose");
const { redisClient } = require("./redisClient");
const logger = require("./logger");

// Load environment variables
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const POOL_TIMEOUT_MS = 30000;

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: POOL_TIMEOUT_MS,
    });
    logger.logWithRequestId("info", "Connected to MongoDB");
  } catch (error) {
    logger.logWithRequestId("error", "Database connection error:", {
      error: error.message,
    });
    throw error;
  }
}

async function getDatabase() {
  if (!mongoose.connection.db) {
    await connectToDatabase();
  }
  return mongoose.connection.db;
}

async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.logWithRequestId("info", "Disconnected from MongoDB");
  }
  if (redisClient) {
    redisClient.quit();
    logger.logWithRequestId("info", "Disconnected from Redis");
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase,
};

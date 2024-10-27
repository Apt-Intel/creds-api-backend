const mongoose = require("mongoose");
const { redisClient } = require("./redisClient");
const logger = require("./logger");

// Load environment variables
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const POOL_TIMEOUT_MS = 30000;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: POOL_TIMEOUT_MS,
    });
    logger.info("Connected to MongoDB", { requestId: "system" });
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
};

async function getDatabase() {
  if (!mongoose.connection.db) {
    await connectToDatabase();
  }
  return mongoose.connection.db;
}

async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("Disconnected from MongoDB", { requestId: "system" });
  }
  if (redisClient) {
    redisClient.quit();
    logger.info("Disconnected from Redis", { requestId: "system" });
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase,
};

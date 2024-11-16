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
      retryWrites: true,
      retryReads: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
    });
    logger.info("Connected to MongoDB", { requestId: "system" });
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    if (error.name === "MongoTimeoutError") {
      logger.error(
        "MongoDB connection timed out. Please check network connectivity and MongoDB Atlas status."
      );
    }
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...", {
    requestId: "system",
  });
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected", { requestId: "system" });
});

async function getDatabase(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!mongoose.connection.db) {
        await connectToDatabase();
      }
      return mongoose.connection.db;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      logger.warn(
        `Database connection attempt ${attempt} failed. Retrying...`,
        { requestId: "system" }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
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

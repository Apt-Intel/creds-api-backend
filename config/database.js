const mongoose = require("mongoose");
const redis = require("redis");
const { promisify } = require("util");
const logger = require("./logger");

// Load environment variables
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const REDIS_URL = process.env.REDIS_URL;

// Optimize connection settings
const POOL_TIMEOUT_MS = 30000;
// Remove POOL_SIZE constant as it's no longer used

let client;
let db;

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: POOL_TIMEOUT_MS,
    });
    logger.info("Connected to MongoDB");

    const redisClient = redis.createClient(REDIS_URL);
    redisClient.on("error", (error) => {
      logger.error("Redis error:", error);
    });
    redisClient.on("connect", () => {
      logger.info("Connected to Redis");
    });
    redisClient.on("ready", async () => {
      logger.info("Redis is ready");
      // Clear all keys in Redis
      await redisClient.flushall();
      logger.info("Redis cache cleared");
    });

    // Promisify Redis methods
    ["get", "set", "del", "incr", "expire", "flushall"].forEach((method) => {
      redisClient[`${method}Async`] = promisify(redisClient[method]).bind(
        redisClient
      );
    });

    global.redisClient = redisClient;
  } catch (error) {
    logger.error("Database connection error:", error);
    throw error;
  }
}

async function getDatabase() {
  if (!db) {
    await connectToDatabase();
    db = mongoose.connection.db;
  }
  return db;
}

async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("Disconnected from MongoDB");
  }
  if (global.redisClient) {
    global.redisClient.quit();
    logger.info("Disconnected from Redis");
  }
}

module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabase,
};

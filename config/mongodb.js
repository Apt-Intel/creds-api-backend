const mongoose = require("mongoose");
const logger = require("./logger");

const MONGODB_URI = process.env.MONGODB_URI;
const POOL_TIMEOUT_MS = 30000;

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: POOL_TIMEOUT_MS,
    });
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
}

async function getDatabase() {
  if (!mongoose.connection.db) {
    await connectToMongoDB();
  }
  return mongoose.connection.db;
}

async function closeMongoDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("Disconnected from MongoDB");
  }
}

module.exports = {
  connectToMongoDB,
  getDatabase,
  closeMongoDB,
};

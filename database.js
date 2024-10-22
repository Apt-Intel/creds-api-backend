const mongoose = require("mongoose");
const logger = require("./config/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { connectToDatabase } = require("./config/database");
const authMiddleware = require("./middlewares/authMiddleware");
const complexRateLimitMiddleware = require("./middlewares/complexRateLimitMiddleware");
const dateNormalizationMiddleware = require("./middlewares/dateNormalizationMiddleware");
const logger = require("./config/logger");

// Add this near the top of the file, after loading environment variables
if (!process.env.API_KEY) {
  console.error("API_KEY is not set in the environment variables");
  process.exit(1);
}
console.log("API_KEY from env:", process.env.API_KEY);

const app = express();

// Apply security middlewares
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan("combined"));

// Parse JSON bodies
app.use(express.json());

// Apply authentication and rate limiting to all routes except health check
app.use(/^(?!\/health$).*/, authMiddleware);
app.use(/^(?!\/health$).*/, complexRateLimitMiddleware);

// Apply date normalization only to routes that return date information
app.use("/api", dateNormalizationMiddleware);

// Routes
app.use("/api/json/v1", require("./routes/api/v1/searchByLogin"));

// Health check route
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to connect to the database", error);
    process.exit(1);
  });

module.exports = app;

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully");
  await connectToDatabase().then(() => process.exit(0));
});

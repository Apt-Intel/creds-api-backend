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
const searchByLoginRoutes = require("./routes/api/v1/searchByLogin");
app.use("/api/json/v1", searchByLoginRoutes);

// Log all routes
app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

// Health check route
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Test route
app.get("/api/json/v1/test-date-normalization", (req, res) => {
  res.json({
    testLogDate1: "17.05.2022 5:28:48",
    testLogDate2: "2022-05-17T05:28:48.375Z",
    testLogDate3: "5/17/2022 5:28:48 AM",
    Date: "2023-10-21 14:30:00", // This should remain unchanged
    nonDateField: "This is not a date",
  });
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

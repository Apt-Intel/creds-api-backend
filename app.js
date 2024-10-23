const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { connectToDatabase } = require("./config/database");
const authMiddleware = require("./middlewares/authMiddleware");
const complexRateLimitMiddleware = require("./middlewares/complexRateLimitMiddleware");
const dateNormalizationMiddleware = require("./middlewares/dateNormalizationMiddleware");
const requestIdMiddleware = require("./middlewares/requestIdMiddleware");
const logger = require("./config/logger");
const sortingMiddleware = require("./middlewares/sortingMiddleware");
const searchByDomainRouter = require("./routes/api/internal/searchByDomain");

// Add this near the top of the file, after loading environment variables
if (!process.env.API_KEY) {
  console.error("API_KEY is not set in the environment variables");
  process.exit(1);
}
logger.logWithRequestId("info", `API_KEY from env: ${process.env.API_KEY}`);

const app = express();

// Apply security middlewares
app.use(helmet());
app.use(cors());

// Add request ID middleware
app.use(requestIdMiddleware);

// Logging middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Parse JSON bodies
app.use(express.json());

// Apply authentication and rate limiting to all routes except health check
app.use(/^(?!\/health$).*/, authMiddleware);
app.use(/^(?!\/health$).*/, complexRateLimitMiddleware);

// Routes
const v1SearchByLoginRouter = require("./routes/api/v1/searchByLogin");
const v1SearchByLoginBulkRouter = require("./routes/api/v1/searchByLoginBulk");
const internalSearchByLoginRouter = require("./routes/api/internal/searchByLogin");
const internalSearchByLoginBulkRouter = require("./routes/api/internal/searchByLoginBulk");

app.use("/api/json/v1", v1SearchByLoginRouter);
app.use("/api/json/v1", v1SearchByLoginBulkRouter);
app.use("/api/json/internal", internalSearchByLoginRouter);
app.use("/api/json/internal", internalSearchByLoginBulkRouter);
app.use("/api/json/internal", searchByDomainRouter);

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
  logger.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: "Something went wrong!", details: err.message });
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

// Add this near your other test routes
app.get("/api/json/v1/test-sorting", (req, res) => {
  const testData = {
    results: [
      { "Log date": "2023-01-03 10:00:00" },
      { "Log date": "2023-01-01 10:00:00" },
      { "Log date": "2023-01-02 10:00:00" },
    ],
  };

  req.searchResults = testData;
  req.query = {
    sortby: req.query.sortby || "date_compromised",
    sortorder: req.query.sortorder || "desc",
  };

  sortingMiddleware(req, res, () => {
    res.json(req.searchResults);
  });
});

// Add this near your other test routes
app.get("/api/json/v1/test-db-sorting", async (req, res) => {
  const sortBy = req.query.sortby || "date_compromised";
  const sortOrder = req.query.sortorder || "desc";
  const limit = 10;

  try {
    const db = await getDatabase();
    const collection = db.collection("logs");

    const sortField = sortBy === "date_uploaded" ? "Date" : "Log date";
    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const results = await collection
      .find({})
      .sort(sortOptions)
      .limit(limit)
      .toArray();

    res.json({
      sortBy,
      sortOrder,
      results,
    });
  } catch (error) {
    logger.error("Error in test-db-sorting:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Add this near your other test routes
app.get(
  "/api/json/v1/test-normalization-sorting",
  (req, res, next) => {
    req.searchResults = {
      results: [
        { "Log date": "17.05.2022 5:28:48" },
        { "Log date": "2022-05-17T05:28:48.375Z" },
        { "Log date": "5/17/2022 5:28:48 AM" },
      ],
    };
    next();
  },
  dateNormalizationMiddleware,
  sortingMiddleware
);

const PORT = process.env.PORT || 3000;

const startServer = () => {
  connectToDatabase()
    .then(() => {
      const server = app.listen(PORT, () => {
        logger.logWithRequestId("info", `Server is running on port ${PORT}`);
      });

      server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          logger.logWithRequestId(
            "error",
            `Port ${PORT} is already in use. Please check your environment configuration and ensure the port is available.`
          );
        } else {
          logger.logWithRequestId("error", "Error starting server:", {
            error: error.message,
          });
        }
        process.exit(1);
      });
    })
    .catch((error) => {
      logger.logWithRequestId("error", "Failed to connect to the database", {
        error: error.message,
      });
      process.exit(1);
    });
};

startServer();

module.exports = app;

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.logWithRequestId("info", "Shutting down gracefully");
  await connectToDatabase().then(() => process.exit(0));
});

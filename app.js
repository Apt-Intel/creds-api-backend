require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const authMiddleware = require("./middlewares/authMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");
const complexRateLimitMiddleware = require("./middlewares/complexRateLimitMiddleware");
const dateNormalizationMiddleware = require("./middlewares/dateNormalizationMiddleware");
const requestIdMiddleware = require("./middlewares/requestIdMiddleware");
const requestLogger = require("./middlewares/requestLogger");
const logger = require("./config/logger");
const sortingMiddleware = require("./middlewares/sortingMiddleware");
const searchByMailRoutes = require("./routes/api/v1/searchByMail");
const searchByMailBulkRoutes = require("./routes/api/v1/searchByMailBulk");
const internalSearchByLoginRouter = require("./routes/api/internal/searchByLogin");
const internalSearchByLoginBulkRouter = require("./routes/api/internal/searchByLoginBulk");
const searchByDomainRouter = require("./routes/api/v1/searchByDomain");
const searchByDomainBulkRouter = require("./routes/api/v1/searchByDomainBulk");
const internalSearchByDomainRouter = require("./routes/api/internal/searchByDomain");
const internalSearchByDomainBulkRouter = require("./routes/api/internal/searchByDomainBulk");
const { generateApiKey, updateApiKeyStatus } = require("./utils/apiKeyUtils");
const { sequelize } = require("./config/sequelize");
const basicAuth = require("express-basic-auth");
const { hashApiKey } = require("./utils/hashUtils");
const { ApiKey } = require("./models");
const { connectToDatabase, closeDatabase } = require("./config/database");
const { getApiKeyDetails } = require("./services/apiKeyService");
const { getUsageStats } = require("./services/loggingService");
const createError = require("http-errors");

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

// Basic authentication for admin routes
const adminAuth = basicAuth({
  users: { admin: process.env.ADMIN_PASSWORD },
  challenge: true,
  realm: "Admin Area",
});

// Remove authentication for the search-by-mail route
app.use("/api/json/v1", searchByMailRoutes);

// Apply authentication, complex rate limiting, and request logging to all routes except health check and admin routes
app.use(
  /^(?!\/health$|\/admin\/).*/,
  authMiddleware,
  rateLimiter,
  complexRateLimitMiddleware,
  requestLogger
);

// Routes
app.use("/api/json/v1", searchByMailBulkRoutes);
app.use("/api/json/internal", internalSearchByLoginRouter);
app.use("/api/json/internal", internalSearchByLoginBulkRouter);
app.use("/api/json/internal", internalSearchByDomainRouter);
app.use("/api/json/internal", internalSearchByDomainBulkRouter);
app.use("/api/json/v1", searchByDomainRouter);
app.use("/api/json/v1", searchByDomainBulkRouter);

// Health check route
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// Make sure this route is defined before the catch-all middleware
app.post("/admin/generate-api-key", adminAuth, async (req, res) => {
  try {
    const {
      userId,
      metadata,
      endpointsAllowed,
      rateLimit,
      dailyLimit,
      monthlyLimit,
      status = "active", // Default status
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const apiKeyData = await generateApiKey(
      userId,
      metadata,
      endpointsAllowed,
      rateLimit,
      dailyLimit,
      monthlyLimit
    );

    // Update the status if it's provided in the request
    if (status && status !== "active") {
      await updateApiKeyStatus(
        apiKeyData.apiKey,
        status,
        endpointsAllowed,
        rateLimit,
        dailyLimit,
        monthlyLimit
      );
    }

    res.json(apiKeyData);
  } catch (error) {
    logger.error("Error generating API key:", error);
    res.status(500).json({
      error: "Failed to generate API key",
      details: error.message,
    });
  }
});

// Admin route to update API key status
app.post("/admin/update-api-key-status", adminAuth, async (req, res) => {
  try {
    const {
      apiKey,
      status,
      endpointsAllowed,
      rateLimit,
      dailyLimit,
      monthlyLimit,
    } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }
    const updatedApiKey = await updateApiKeyStatus(
      apiKey,
      status,
      endpointsAllowed,
      rateLimit,
      dailyLimit,
      monthlyLimit
    );
    res.json({ message: "API key updated successfully", updatedApiKey });
  } catch (error) {
    logger.error("Error updating API key status:", error);
    if (error.message === "API key not found") {
      return res.status(404).json({ error: "API key not found" });
    }
    res.status(500).json({
      error: "Failed to update API key status",
      details: error.message,
    });
  }
});

// Admin route to check API key details
app.get("/admin/check-api-key/:apiKey", adminAuth, async (req, res) => {
  logger.info(`Received request to check API key: ${req.params.apiKey}`);
  try {
    const { apiKey } = req.params;
    const apiKeyData = await getApiKeyDetails(apiKey);

    if (!apiKeyData) {
      logger.warn(`API key not found: ${apiKey}`);
      return res.status(404).json({ error: "API key not found" });
    }

    logger.info(`API key details retrieved for: ${apiKey}`);
    res.json({
      message: "API key details retrieved",
      details: {
        id: apiKeyData.id,
        status: apiKeyData.status,
        userId: apiKeyData.user_id,
        hashedApiKey: apiKeyData.api_key,
        endpointsAllowed: apiKeyData.endpoints_allowed,
        rateLimit: apiKeyData.rate_limit,
        dailyLimit: apiKeyData.daily_limit,
        monthlyLimit: apiKeyData.monthly_limit,
        metadata: apiKeyData.metadata,
      },
    });
  } catch (error) {
    logger.error(`Error checking API key: ${req.params.apiKey}`, error);
    res
      .status(500)
      .json({ error: "Failed to check API key", details: error.message });
  }
});

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.originalUrl}`);
  next();
});

// Move this middleware to the end of all route definitions
app.use((req, res, next) => {
  next(createError(405, "Method Not Allowed"));
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDatabase();
    await sequelize.authenticate();
    console.log("Connected to MongoDB and PostgreSQL");

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
  } catch (error) {
    logger.logWithRequestId("error", "Failed to connect to databases", {
      error: error.message,
    });
    process.exit(1);
  }
};

startServer();

module.exports = app;

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.logWithRequestId("info", "Shutting down gracefully");
  await closeDatabase();
  await sequelize.close();
  process.exit(0);
});

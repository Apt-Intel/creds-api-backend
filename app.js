require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const authMiddleware = require("./middlewares/authMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");
const complexRateLimitMiddleware = require("./middlewares/complexRateLimitMiddleware");
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
const { generateApiKey, updateApiKeyDetails } = require("./utils/apiKeyUtils");
const { sequelize } = require("./config/sequelize");
const basicAuth = require("express-basic-auth");
const { hashApiKey } = require("./utils/hashUtils");
const { ApiKey } = require("./models");
const { connectToDatabase, closeDatabase } = require("./config/database");
const { getApiKeyDetails } = require("./services/apiKeyService");
const { getUsageStats } = require("./services/loggingService");
const createError = require("http-errors");
const {
  initializeScheduledJobs,
  shutdownScheduledJobs,
} = require("./scheduledJobs");
const apiKeyDataMiddleware = require("./middlewares/apiKeyDataMiddleware");
const {
  errorHandlerMiddleware,
} = require("./middlewares/errorHandlerMiddleware");

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

// Add the usage route before applying complexRateLimitMiddleware
const usageRouter = require("./routes/api/v1/usage");
app.use("/api/json/v1", authMiddleware, rateLimiter, usageRouter);

// Apply complexRateLimitMiddleware after the usage route
app.use(
  /^(?!\/health$|\/admin\/).*/,
  authMiddleware,
  apiKeyDataMiddleware,
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

// Add this line with your other route declarations
app.use("/api/json/v1", usageRouter);

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
      await updateApiKeyDetails(
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
      userId,
      endpointsAllowed,
      rateLimit,
      dailyLimit,
      monthlyLimit,
      metadata,
      timezone,
    } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    const updatedApiKey = await updateApiKeyDetails(apiKey, {
      status,
      userId,
      endpointsAllowed,
      rateLimit,
      dailyLimit,
      monthlyLimit,
      metadata,
      timezone,
    });

    res.json({
      message: "API key updated successfully",
      updatedApiKey: {
        id: updatedApiKey.id,
        userId: updatedApiKey.user_id,
        status: updatedApiKey.status,
        endpointsAllowed: updatedApiKey.endpoints_allowed,
        rateLimit: updatedApiKey.rate_limit,
        dailyLimit: updatedApiKey.daily_limit,
        monthlyLimit: updatedApiKey.monthly_limit,
        metadata: updatedApiKey.metadata,
        timezone: updatedApiKey.timezone,
        createdAt: updatedApiKey.created_at,
        updatedAt: updatedApiKey.updated_at,
        lastResetDate: updatedApiKey.last_reset_date,
      },
    });
  } catch (error) {
    logger.error("Error updating API key:", error);
    if (error.message === "API key not found") {
      return res.status(404).json({ error: "API key not found" });
    }
    res.status(500).json({
      error: "Failed to update API key",
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

    // Fetch usage statistics
    const usageStats = await getUsageStats(apiKeyData.id);

    logger.info(`API key details retrieved for: ${apiKey}`);
    res.json({
      message: "API key details retrieved",
      details: {
        id: apiKeyData.id,
        status: apiKeyData.status,
        userId: apiKeyData.userId,
        hashedApiKey: apiKeyData.hashedApiKey,
        endpointsAllowed: apiKeyData.endpointsAllowed,
        rateLimit: apiKeyData.rateLimit,
        dailyLimit: apiKeyData.dailyLimit,
        monthlyLimit: apiKeyData.monthlyLimit,
        metadata: apiKeyData.metadata,
        timezone: apiKeyData.timezone,
        createdAt: apiKeyData.created_at,
        updatedAt: apiKeyData.updated_at,
        lastResetDate: apiKeyData.last_reset_date,
        usage: {
          dailyRequests: usageStats.daily_requests,
          monthlyRequests: usageStats.monthly_requests,
          totalRequests: usageStats.total_requests,
          remainingDailyRequests: usageStats.remaining_daily_requests,
          remainingMonthlyRequests: usageStats.remaining_monthly_requests,
          lastRequestDate: usageStats.last_request_date,
        },
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

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

let cronJob;

async function startServer() {
  try {
    // Initialize other components
    cronJob = initializeScheduledJobs();

    // Setup graceful shutdown
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    // Start your Express app
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  try {
    logger.info("Received shutdown signal");

    // Stop cron job
    shutdownScheduledJobs();

    // Close database connections
    await sequelize.close();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.logWithRequestId("info", "Shutting down gracefully");
  await closeDatabase();
  await sequelize.close();
  process.exit(0);
});

async function updateApiKey(req, res) {
  // ... existing update logic ...
}

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  // Consider exiting the process gracefully
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Consider exiting the process gracefully
});

app.set("trust proxy", true);

// Add this near your route registration
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", {
    promise,
    reason,
    stack: reason.stack,
  });
});

// Update the route registration with error handling
try {
  app.use(
    "/api/json/internal",
    require("./routes/api/internal/searchByDomain")
  );
  app.use(
    "/api/json/internal",
    require("./routes/api/internal/searchByDomainBulk")
  );
} catch (error) {
  logger.error("Error registering routes:", {
    error: error.message,
    stack: error.stack,
  });
}

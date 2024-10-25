require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const authMiddleware = require("./middlewares/authMiddleware");
const complexRateLimitMiddleware = require("./middlewares/complexRateLimitMiddleware");
const dateNormalizationMiddleware = require("./middlewares/dateNormalizationMiddleware");
const requestIdMiddleware = require("./middlewares/requestIdMiddleware");
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

// // Add this near the top of the file, after loading environment variables
// if (!process.env.API_KEY) {
//   console.error("API_KEY is not set in the environment variables");
//   process.exit(1);
// }
// logger.logWithRequestId("info", `API_KEY from env: ${process.env.API_KEY}`);

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

// Apply authentication and rate limiting to all routes except health check, admin routes, and search-by-mail
app.use(
  /^(?!\/health$|\/admin\/|\/api\/json\/v1\/search-by-mail).*/,
  authMiddleware
);
app.use(
  /^(?!\/health$|\/admin\/|\/api\/json\/v1\/search-by-mail).*/,
  complexRateLimitMiddleware
);

// Routes
app.use("/api/json/v1", searchByMailBulkRoutes);
app.use("/api/json/internal", internalSearchByLoginRouter);
app.use("/api/json/internal", internalSearchByLoginBulkRouter);
app.use("/api/json/internal", internalSearchByDomainRouter);
app.use("/api/json/internal", internalSearchByDomainBulkRouter);

// Add the new domain search routes
app.use("/api/json/v1", searchByDomainRouter);
app.use("/api/json/v1", searchByDomainBulkRouter);

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
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message;
  res.status(statusCode).json({ error: "Something went wrong!", message });
});

// Test routes (keep these if you still need them)
// ...

// Admin route to generate API keys with basic auth
app.post("/admin/generate-api-key", adminAuth, async (req, res) => {
  try {
    const { userId, metadata } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID (email) is required" });
    }
    if (!/\S+@\S+\.\S+/.test(userId)) {
      return res
        .status(400)
        .json({ error: "Invalid email format for User ID" });
    }
    const {
      apiKey,
      hashedApiKey,
      userId: generatedUserId,
    } = await generateApiKey(userId, metadata);
    res.json({ apiKey, hashedApiKey, userId: generatedUserId });
  } catch (error) {
    logger.error("Error generating API key:", error);
    res
      .status(500)
      .json({ error: "Failed to generate API key", details: error.message });
  }
});

// Admin route to update API key status
app.post("/admin/update-api-key-status", adminAuth, async (req, res) => {
  try {
    const { apiKey, status } = req.body;
    if (!apiKey || !status) {
      return res.status(400).json({ error: "API key and status are required" });
    }
    const updatedApiKey = await updateApiKeyStatus(apiKey, status);
    res.json({ message: "API key status updated successfully", updatedApiKey });
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
app.post("/admin/check-api-key/:apiKey", adminAuth, async (req, res) => {
  try {
    const { apiKey } = req.params;
    const hashedApiKey = hashApiKey(apiKey);
    const apiKeyData = await ApiKey.findOne({
      where: { api_key: hashedApiKey },
    });

    if (!apiKeyData) {
      return res.status(404).json({ error: "API key not found" });
    }

    res.json({
      message: "API key found",
      details: {
        id: apiKeyData.id,
        status: apiKeyData.status,
        userId: apiKeyData.user_id,
        hashedApiKey: apiKeyData.api_key,
      },
    });
  } catch (error) {
    logger.error("Error checking API key:", error);
    res
      .status(500)
      .json({ error: "Failed to check API key", details: error.message });
  }
});

console.log("Registered routes:");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  }
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

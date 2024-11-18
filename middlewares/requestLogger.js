const logger = require("../config/logger");
const { DEFAULT_PAGE_SIZE } = require("../config/constants");

const requestLogger = (req, res, next) => {
  // Extract pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;

  // Log request details with pagination info
  logger.info(`API Request`, {
    method: req.method,
    path: req.path,
    requestId: req.requestId,
    apiKeyId: req.apiKeyData?.id,
    query: {
      ...req.query,
      page,
      page_size: pageSize,
    },
    body: sanitizeLogData(req.body),
    pagination: {
      page,
      page_size: pageSize,
    },
  });

  // Store start time for response time calculation
  req.requestStartTime = Date.now();

  // Capture response using response event
  res.on("finish", () => {
    const responseTime = Date.now() - req.requestStartTime;

    logger.info(`API Response`, {
      method: req.method,
      path: req.path,
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      pagination: {
        page,
        page_size: pageSize,
      },
    });
  });

  next();
};

// Helper function to sanitize sensitive data before logging
const sanitizeLogData = (data) => {
  if (!data) return data;

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = ["password", "api_key", "token"];
  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  });

  // Handle arrays (like in bulk operations)
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  // Handle nested objects
  if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === "object") {
        sanitized[key] = sanitizeLogData(data[key]);
      }
    });
  }

  return sanitized;
};

module.exports = requestLogger;

const logger = require("../config/logger");

/**
 * Maps HTTP status codes to standard error codes
 */
const ERROR_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  429: "RATE_LIMIT_EXCEEDED",
  500: "INTERNAL_SERVER_ERROR",
};

/**
 * Standardizes error responses while maintaining existing logging
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  // Determine status code
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = ERROR_CODES[statusCode] || "UNKNOWN_ERROR";

  // Log error using existing logging implementation
  logger.error("API Error:", {
    error: err.message,
    code: errorCode,
    stack: err.stack,
    requestId: req.requestId,
    endpoint: `${req.method} ${req.originalUrl}`,
    statusCode,
  });

  // Construct standardized error response
  const errorResponse = {
    meta: {
      error: {
        code: errorCode,
        message: err.message || "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : {
                stack: err.stack,
                requestId: req.requestId,
              },
      },
    },
    data: null,
  };

  // Add rate limit information if applicable
  if (statusCode === 429) {
    errorResponse.meta.error.retryAfter = err.retryAfter;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Utility function to create standardized API errors
 */
const createAPIError = (message, statusCode = 500, details = {}) => {
  return new APIError(message, statusCode, details);
};

module.exports = {
  errorHandlerMiddleware,
  APIError,
  createAPIError,
};

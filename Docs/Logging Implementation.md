### Logging Implementation Documentation

This document describes the logging implementation in the codebase, including error handling and environment-specific behaviors.

#### Core Components

##### 1. Logger Configuration (`config/logger.js`)

The application uses Winston for logging with environment-specific configurations:

```javascript
const winston = require("winston");
require("winston-daily-rotate-file");

// Log levels per environment
const getLogLevel = () => {
  switch (process.env.NODE_ENV) {
    case "development":
      return "debug";
    case "test":
      return "warn";
    case "production":
      return "info";
    default:
      return "info";
  }
};
```

##### 2. Error Handling (`middlewares/errorHandlerMiddleware.js`)

The application implements centralized error handling with environment-aware responses:

```javascript
const errorHandlerMiddleware = (err, req, res, next) => {
  // Always log full error details
  logger.error("API Error:", {
    error: err.message,
    code: errorCode,
    stack: err.stack,
    requestId: req.requestId,
    endpoint: `${req.method} ${req.originalUrl}`,
    statusCode,
  });

  // Environment-aware response
  const errorResponse = {
    meta: {
      error: {
        code: errorCode,
        message: err.message,
        // Only include stack trace in development
        details:
          process.env.NODE_ENV === "development"
            ? { stack: err.stack, requestId: req.requestId }
            : undefined,
      },
    },
    data: null,
  };
};
```

#### Environment-Specific Behavior

##### Development Mode (`NODE_ENV=development`)

1. **Logging Level:** `debug`

   - Includes detailed debug information
   - All log levels are captured

2. **Error Responses:**

   - Include stack traces
   - Show detailed error information
   - Include request IDs

3. **Example Development Error Response:**

```json
{
  "meta": {
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "Failed to process request",
      "details": {
        "stack": "Error: Failed to process request\n    at processRequest (/app/src/controllers/controller.js:25:9)...",
        "requestId": "123e4567-e89b-12d3-a456-426614174000"
      }
    }
  },
  "data": null
}
```

##### Production Mode (`NODE_ENV=production`)

1. **Logging Level:** `info`

   - Excludes debug information
   - Captures info, warn, and error levels

2. **Error Responses:**

   - Exclude stack traces
   - Show only essential error information
   - Maintain security by hiding implementation details

3. **Example Production Error Response:**

```json
{
  "meta": {
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "Failed to process request"
    }
  },
  "data": null
}
```

#### Logging Best Practices

1. **Always Use the Logger:**

```javascript
const logger = require("../config/logger");

// Good
logger.info("Operation successful", { operationId: id });
logger.error("Operation failed", { error: err });

// Avoid
console.log("Operation successful");
console.error("Operation failed");
```

2. **Include Context:**

```javascript
logger.error("Database operation failed", {
  operation: "insert",
  collection: "users",
  error: err.message,
  requestId: req.requestId,
});
```

3. **Use Appropriate Log Levels:**

- `error`: For errors that need immediate attention
- `warn`: For warning conditions
- `info`: For general operational information
- `debug`: For detailed debugging information

#### Error Handling Best Practices

1. **Use Custom APIError:**

```javascript
const { createAPIError } = require("../middlewares/errorHandlerMiddleware");

// Create standardized errors
throw createAPIError("Invalid input", 400, { field: "email" });
```

2. **Always Use Next for Error Handling:**

```javascript
try {
  // Operation that might fail
} catch (error) {
  next(error); // Let the error handler middleware handle it
}
```

## Log File Structure

```
logs/
├── application/
│   └── application-YYYY-MM-DD.log
├── errors/
│   └── error-YYYY-MM-DD.log
└── combined/
    └── combined.log
```

#### Monitoring and Maintenance

1. **Log Rotation:**

   - Logs are rotated daily
   - Compressed after rotation
   - Retained for 14 days

2. **Log Monitoring:**
   - Use monitoring tools to track error rates
   - Set up alerts for critical errors
   - Regular log analysis for patterns

#### Security Considerations

1. **Sensitive Data:**

   - Never log sensitive information (passwords, tokens)
   - Mask sensitive data in logs
   - Be cautious with stack traces in production

2. **Access Control:**
   - Restrict log file access
   - Implement proper file permissions
   - Regular log file cleanup

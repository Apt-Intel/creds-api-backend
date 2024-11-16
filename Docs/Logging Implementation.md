### Logging Implementation Documentation

#### 1. How is Logging Implemented in This Codebase?

Logging in this codebase is implemented using the `winston` library with the `winston-daily-rotate-file` transport for log rotation. The logger is configured and initialized in the `config/logger.js` file. The logger is then used throughout the application to log various levels of messages, such as `info`, `error`, and `debug`.

#### 2. What Structure Does It Follow?

The logging implementation follows a modular structure:

- `config/logger.js`: Initializes and exports the logger with various configurations.
- `middlewares/requestIdMiddleware.js`: Provides a namespace for request IDs used in logging.

The logging system uses the following directory structure:

```
├── application/
│ ├── application-YYYY-MM-DD.log
│ ├── application-YYYY-MM-DD.log.gz (for older, compressed logs)
│ └── .[hash]-audit.json
├── errors/
│ ├── error-YYYY-MM-DD.log
│ ├── error-YYYY-MM-DD.log.gz (for older, compressed logs)
│ └── .[hash]-audit.json
├── combined/
│ └── combined.log
├── date_parsing/
│ └── date_parsing_errors.log
└── new_date_formats/
  └── new_date_formats.log
```

The `.audit.json` files are created and managed by the `winston-daily-rotate-file` transport to keep track of the log files.

#### 3. Guidelines for Using Logging for New Features

When adding new features that require logging, follow these guidelines:

1. **Log Levels**: Use appropriate log levels (`info`, `error`, `debug`, etc.) based on the environment and importance of the message.
2. **Request IDs**: Include request IDs in log messages for better traceability.
3. **Error Handling**: Ensure proper error handling when logging errors to avoid application crashes.
4. **Environment-Based Logging**: Adjust log levels based on the environment using the `getLogLevel` function.

#### 4. Implementation Details

##### Logger Initialization

The logger is initialized in `config/logger.js`:

```javascript
const winston = require("winston");
const path = require("path");
const { namespace } = require("../middlewares/requestIdMiddleware");
const { v4: uuidv4 } = require("uuid");
require("winston-daily-rotate-file");
const getLogLevel = () => {
  switch (process.env.NODE_ENV) {
    case "development":
      return "debug";
    case "test":
      return "info";
    case "production":
      return "warn";
    default:
      return "info";
  }
};
// ... (rest of the configuration)
```

##### Environment-Based Log Levels

The `getLogLevel` function determines the appropriate log level based on the current environment:

```javascript
const getLogLevel = () => {
  switch (process.env.NODE_ENV) {
    case "development":
      return "debug";
    case "test":
      return "info";
    case "production":
      return "warn";
    default:
      return "info";
  }
};
```

This ensures that logging is optimized for each environment, with more verbose logging in development and less in production.

##### Log Rotation

We use `winston-daily-rotate-file` for log rotation:

```javascript
const applicationLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "application", "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});
```

This configuration rotates log files daily, compresses old logs, and maintains logs for up to 14 days.

##### Using the Logger

To use the logger in your code, import it from `config/logger.js`:

```javascript
const logger = require("../config/logger");

logger.info("This is an info message");
logger.error("This is an error message");
logger.debug("This is a debug message");
```

###### Example: Logging in Controllers

In the `loginBulkController.js`, we use logging to track the progress of bulk search operations:

```javascript
logger.info(
  `Bulk search request received for ${logins.length} logins, page: ${page}, installed_software: ${installedSoftware}`
);

// ... (after processing)

logger.info(
  `Bulk search completed for ${
    logins.length
  } logins, total results: ${totalResults}, processing time: ${totalTime.toFixed(
    2
  )}ms`
);
```

###### Example: Logging in Middlewares

In middlewares like `dateNormalizationMiddleware.js` and `sortingMiddleware.js`, we use logging to track the execution of these middleware functions:

```javascript
// dateNormalizationMiddleware.js
logger.info("Date normalization middleware called");
// ... (after processing)
logger.info("Date normalization completed");

// sortingMiddleware.js
logger.info("Sorting middleware called");
logger.info(`Sorting parameters: sortBy=${sortField}, sortOrder=${sortOrder}`);
// ... (after processing)
logger.info("Sorting completed");
```

##### Logging with Request ID

To log messages with a request ID, use the `logWithRequestId` method:

```javascript
logger.logWithRequestId("info", "This is an info message with request ID");
```

##### Error Logging

A separate file is used for error logs:

```javascript
const errorLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "errors", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});
```

This ensures that error logs are easily accessible and don't get mixed with other log levels.

##### System Request ID

A `systemRequestId` is generated to ensure that all logs have a request ID, even if not provided by the request middleware:

```javascript
const systemRequestId = uuidv4();
```

#### 5. Best Practices

1. Always use the appropriate log level (`info`, `warn`, `error`, `debug`) based on the nature of the message.
2. Include relevant context in log messages, such as function names, input parameters, or error details.
3. Use structured logging (objects) when possible for easier parsing and analysis.
4. Avoid logging sensitive information like passwords or API keys.

#### 6. Troubleshooting

- If logs are not appearing, check the log level set by the environment variable.
- Ensure that the log directory exists and has proper write permissions.
- For performance issues, consider adjusting the log levels in production.
- Check the `error.log` file for any logging-related errors.

#### 7. Performance Considerations

- In production, set the log level to "warn" or "error" to minimize I/O operations.
- Use async logging when possible to avoid blocking the main thread.
- Consider implementing log buffering for high-traffic applications.

By following these guidelines and utilizing the provided logging infrastructure, you can ensure consistent and effective logging throughout the application, aiding in debugging, monitoring, and maintaining the system.

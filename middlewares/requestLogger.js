const { logRequest } = require("../services/loggingService");
const logger = require("../config/logger");
const MAX_RESPONSE_SIZE = 1024 * 1024; // 1MB

const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function
  res.end = function (chunk, encoding) {
    // Restore the original end function
    res.end = originalEnd;

    // Call the original end function
    res.end(chunk, encoding);

    const duration = process.hrtime(startTime);
    const responseTimeMs = Math.round(duration[0] * 1e3 + duration[1] / 1e6);

    let responseSize = 0;
    if (chunk) {
      responseSize = Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, encoding);
    }

    const logData = {
      apiKeyId: req.apiKeyData.id,
      timestamp: new Date(),
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      responseSize,
    };

    if (responseSize <= MAX_RESPONSE_SIZE) {
      Promise.resolve(logRequest(logData)).catch((error) => {
        logger.error("Error logging request:", error);
      });
    } else {
      logger.warn(
        `Large response not logged. Size: ${responseSize} bytes, Endpoint: ${req.originalUrl}`
      );
    }
  };

  next();
};

module.exports = requestLogger;

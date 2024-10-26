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
      api_key_id: req.apiKeyData.id,
      timestamp: new Date(),
      endpoint: req.originalUrl,
      method: req.method,
      status_code: res.statusCode,
      response_time_ms: responseTimeMs,
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
    };

    if (responseSize <= MAX_RESPONSE_SIZE) {
      logRequest(logData)
        .then(() => {
          logger.debug(
            `Request logged successfully for API key ${req.apiKeyData.id}`
          );
        })
        .catch((error) => {
          logger.error(
            `Error logging request for API key ${req.apiKeyData.id}:`,
            error
          );
        });
    } else {
      logger.warn(
        `Large response not logged. Size: ${responseSize} bytes, Endpoint: ${req.originalUrl}, API Key: ${req.apiKeyData.id}`
      );
    }
  };

  next();
};

module.exports = requestLogger;

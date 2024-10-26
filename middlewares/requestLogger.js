const { logRequest } = require("../services/loggingService");

const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const duration = process.hrtime(startTime);
    const responseTimeMs = duration[0] * 1e3 + duration[1] / 1e6;

    const logData = {
      apiKeyId: req.apiKeyData.id,
      timestamp: new Date(),
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    logRequest(logData);
  });

  next();
};

module.exports = requestLogger;

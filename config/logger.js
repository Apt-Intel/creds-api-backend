const winston = require("winston");
const path = require("path");
const { namespace } = require("../middlewares/requestIdMiddleware");
const { v4: uuidv4 } = require("uuid");
require("winston-daily-rotate-file");

// Determine the log level based on the environment
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

// Configure the daily rotate file transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "../logs/application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const systemRequestId = uuidv4();

const logger = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const requestId = namespace.get("requestId") || systemRequestId;
      return JSON.stringify({
        timestamp,
        level,
        message,
        requestId,
        ...meta,
      });
    })
  ),
  transports: [
    new winston.transports.Console(),
    fileRotateTransport,
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, "../logs/error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
    }),
  ],
});

// Update the logWithRequestId method to use the namespace or system request ID
logger.logWithRequestId = (level, message, meta = {}) => {
  const requestId = namespace.get("requestId") || systemRequestId;
  logger.log(level, message, { ...meta, requestId });
};

module.exports = logger;

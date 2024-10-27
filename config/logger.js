const winston = require("winston");
const path = require("path");
const fs = require("fs");
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

// Ensure log directories exist
const logDir = path.join(__dirname, "../logs");
const dirs = [
  "application",
  "errors",
  "combined",
  "date_parsing",
  "new_date_formats",
];
dirs.forEach((dir) => {
  const fullPath = path.join(logDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure the daily rotate file transport for application logs
const applicationLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "application", "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

// Configure the daily rotate file transport for error logs
const errorLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "errors", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});

// Configure the combined log transport
const combinedLogTransport = new winston.transports.File({
  filename: path.join(logDir, "combined", "combined.log"),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
});

const colors = {
  error: "\x1b[31m", // Red
  warn: "\x1b[33m", // Yellow
  info: "\x1b[32m", // Green
  debug: "\x1b[36m", // Cyan
  reset: "\x1b[0m",
};

const colorize = (level, message) => {
  return `${colors[level] || ""}${message}${colors.reset}`;
};

const customFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const colorizedLevel = colorize(level, level.toUpperCase());
    const colorizedTimestamp = `[${timestamp}]`;

    let formattedMessage = `${colorizedTimestamp} ${colorizedLevel}: ${message}`;

    if (Object.keys(metadata).length > 0) {
      const metadataString = JSON.stringify(metadata);
      if (metadataString !== "{}") {
        formattedMessage += ` ${metadataString}`;
      }
    }

    return colorize(level, formattedMessage);
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    applicationLogTransport,
    errorLogTransport,
    combinedLogTransport,
  ],
});

// Update the logWithRequestId method
logger.logWithRequestId = (level, message, meta = {}) => {
  const requestId = meta.requestId || "system";
  logger.log(level, message, { ...meta, requestId });
};

module.exports = logger;

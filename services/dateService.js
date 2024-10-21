const { parse, isValid, format } = require("date-fns");
const winston = require("winston");

const logger = winston.createLogger({
  level: "warn",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: "logs/date_parsing_errors.log" }),
  ],
});

const KNOWN_DATE_FORMATS = [
  "dd/MM/yyyy HH:mm:ss",
  "dd.MM.yyyy H:mm:ss",
  "d/M/yyyy h:mm:ss a",
  // Add more known formats here
];

function normalizeDate(date) {
  if (!date) return null;
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

module.exports = {
  normalizeDate,
};

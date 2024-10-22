const { parse, format } = require("date-fns");
const logger = require("../config/logger");
const fs = require("fs").promises;
const path = require("path");
const moment = require("moment");

const KNOWN_LOG_DATE_FORMATS = [
  "dd.MM.yyyy H:mm:ss",
  "d/M/yyyy h:mm:ss a",
  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  "yyyy-MM-dd HH:mm:ss",
  // Add more known formats for Log date here
];

function guessPossibleFormat(dateString) {
  const formats = [
    "YYYY-MM-DD HH:mm:ss",
    "DD.MM.YYYY HH:mm:ss",
    "MM/DD/YYYY hh:mm:ss A",
    "YYYY-MM-DDTHH:mm:ss.SSSZ",
    // Add more potential formats here
  ];

  for (const format of formats) {
    if (moment(dateString, format, true).isValid()) {
      return format;
    }
  }

  return "Unknown";
}

async function logUnrecognizedFormat(dateString) {
  const logPath = path.join(
    __dirname,
    "../logs/new_date_formats/new_date_formats.log"
  );
  const guessedFormat = guessPossibleFormat(dateString);
  const logEntry = `${new Date().toISOString()}: Unrecognized format - ${dateString} (Possible format: ${guessedFormat})\n`;

  try {
    await fs.appendFile(logPath, logEntry);
  } catch (error) {
    logger.error(`Failed to log new date format: ${error}`);
  }
}

async function parseDate(dateString) {
  if (!dateString) return null;

  for (const formatString of KNOWN_LOG_DATE_FORMATS) {
    try {
      const parsedDate = parse(dateString, formatString, new Date());
      if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, "yyyy-MM-dd HH:mm:ss");
      }
    } catch (error) {
      // If parsing fails, try the next format
    }
  }

  logger.warn(`Unable to parse date: ${dateString}`);
  await logUnrecognizedFormat(dateString);
  return dateString; // Return original string if parsing fails
}

module.exports = {
  parseDate,
};

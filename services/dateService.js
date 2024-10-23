const { parse, format } = require("date-fns");
const logger = require("../config/logger");
const fs = require("fs").promises;
const path = require("path");
const moment = require("moment");

const KNOWN_LOG_DATE_FORMATS = [
  "DD.MM.YYYY HH:mm:ss",
  "D.MM.YYYY HH:mm:ss",
  "DD.M.YYYY HH:mm:ss",
  "D.M.YYYY HH:mm:ss",
  "D/M/YYYY h:mm:ss A",
  "DD/MM/YYYY h:mm:ss A",
  "MM/DD/YYYY h:mm:ss A",
  "M/D/YYYY h:mm:ss A",
  "YYYY-MM-DD'T'HH:mm:ss.SSSX",
  "YYYY-MM-DD HH:mm:ss",
  "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ",
  "ddd MMM D YYYY HH:mm:ss [GMT]ZZ",
  "MM/DD/YYYY HH:mm:ss",
  "M/D/YYYY HH:mm:ss",
  "DD.MM.YYYY HH:mm",
  "D.MM.YYYY HH:mm",
  "DD.M.YYYY HH:mm",
  "D.M.YYYY HH:mm",
  "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ [(]z[)]",
  "D/M/YYYY H:m:s",
  "DD/M/YYYY HH:mm:ss",
  "D/MM/YYYY HH:mm:ss",
  "YYYY-MM-DD hh:mm:ss A",
];

const INVALID_DATE_STRINGS = [
  "null",
  "n/a",
  "na",
  "empty",
  "no/date",
  "undefined",
  "-",
];

function guessPossibleFormat(dateString) {
  for (const format of KNOWN_LOG_DATE_FORMATS) {
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

function customDateParse(dateString) {
  const parts = dateString.split(/[.:\s]/);
  if (parts.length === 6) {
    const [day, month, year, hour, minute, second] = parts;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  return null;
}

function tryParseDateWithMultipleMethods(dateString) {
  // Method 1: Moment with known formats (strict parsing)
  for (const format of KNOWN_LOG_DATE_FORMATS) {
    const parsedDate = moment(dateString, format, true);
    if (parsedDate.isValid()) {
      logger.debug(`Parsed date using format: ${format}`);
      return parsedDate;
    }
  }

  // Method 2: Custom parsing for specific formats
  const customParsedDate = customDateParse(dateString);
  if (customParsedDate && !isNaN(customParsedDate.getTime())) {
    logger.debug(`Parsed date using custom parser`);
    return moment(customParsedDate);
  }

  // Method 3: Native Date parsing
  const nativeDate = new Date(dateString);
  if (!isNaN(nativeDate.getTime())) {
    logger.debug(`Parsed date using native Date`);
    return moment(nativeDate);
  }

  // Method 4: Moment's flexible parsing (as a last resort)
  const flexibleParsedDate = moment(dateString);
  if (flexibleParsedDate.isValid()) {
    logger.debug(`Parsed date using Moment's flexible parsing`);
    return flexibleParsedDate;
  }

  logger.debug(`Failed to parse date: ${dateString}`);
  return null;
}

async function parseDate(dateString) {
  if (!dateString) return null;

  // Convert to lowercase and trim for consistent checking
  const normalizedDateString = dateString.toLowerCase().trim();

  // Check if the normalized string is in the list of invalid date strings
  if (INVALID_DATE_STRINGS.includes(normalizedDateString)) {
    logger.debug(`Invalid date string detected: ${dateString}`);
    return null;
  }

  const parsedDate = tryParseDateWithMultipleMethods(dateString);

  if (parsedDate) {
    return parsedDate.format("YYYY-MM-DD HH:mm:ss");
  }

  logger.warn(`Unable to parse date: ${dateString}`);
  await logUnrecognizedFormat(dateString);
  return dateString; // Return original string if parsing fails
}

function testParseDates() {
  const testDates = [
    "Wed Sep 21 2022 17:57:46 GMT+0200 (Central European Summer Time)",
    "06/23/2023 3:20:08",
    "NO/DATE",
    "30.01.2022 14:48",
    "9/23/2022 10:16:30 PM",
    "2/26/2023 12:30:47 PM",
    "27/9/2022 9:14:40",
    "17/6/2023 0:19:15",
    "Tue Apr 18 2023 18:21:59 GMT+0200 (Central European Summer Time)",
    "22/1/2023 10:40:56",
    "6/11/2022 14:8:24",
    "2023-06-15 09:55:34 PM",
    "24.03.2021 7:08:18",
    "13.08.2023 4:51:42",
    "null",
    "N/A",
    "NA",
    "na",
    "empty",
    "EMPTY",
    "Null",
    "NULL",
    "Empty",
    "undefined",
    "-",
    " ", // empty string with space
    "", // empty string
  ];

  testDates.forEach(async (date) => {
    const result = await parseDate(date);
    console.log(`Input: ${date}, Output: ${result}`);
  });
}

module.exports = {
  parseDate,
  testParseDates,
};

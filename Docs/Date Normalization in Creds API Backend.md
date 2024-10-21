# Date Normalization in Creds API Backend

## Overview

Date normalization is a crucial part of our application, ensuring consistent date formats across different data sources and user inputs. This document outlines how date normalization is implemented, why it's necessary, and how it works within our codebase.

## Relevant Files

1. `services/dateService.js`: Core date parsing and normalization logic
2. `middlewares/dateNormalizationMiddleware.js`: Middleware for normalizing dates in responses
3. `controllers/loginController.js`: Utilizes date normalization in search results
4. `logs/new_date_formats.log`: Log file for unrecognized date formats
5. `app.js`: Application entry point where middleware is applied

## Why Date Normalization?

Date normalization is essential because:

1. It ensures consistency in date representations across the application.
2. It helps in accurate sorting and filtering of data based on dates.
3. It improves data quality and reduces errors in date-based operations.

## How Date Normalization Works

### 1. Date Parsing Service (`dateService.js`)

The core of our date normalization is in `dateService.js`. Here's how it works:

```javascript
const KNOWN_LOG_DATE_FORMATS = [
  "dd.MM.yyyy H:mm:ss",
  "d/M/yyyy h:mm:ss a",
  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  "yyyy-MM-dd HH:mm:ss",
  // More formats can be added here
];

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

  // If no known format matches, log and return original
  logger.warn(`Unable to parse date: ${dateString}`);
  await logUnrecognizedFormat(dateString);
  return dateString;
}
```

This function attempts to parse the input date string using a list of known formats. If successful, it returns the date in a standardized format (`YYYY-MM-DD HH:mm:ss`).

### 2. Date Normalization Middleware (`dateNormalizationMiddleware.js`)

This middleware intercepts responses and normalizes dates:

```javascript
const dateNormalizationMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = async function (data) {
    try {
      if (Array.isArray(data)) {
        data = await Promise.all(data.map(normalizeLogDate));
      } else if (typeof data === "object" && data !== null) {
        data = await normalizeLogDate(data);
      }

      return originalJson.call(this, data);
    } catch (error) {
      logger.error("Error in date normalization middleware:", error);
      return originalJson.call(this, { error: "Internal server error" });
    }
  };

  next();
};
```

This middleware ensures that all "Log date" fields in the response are normalized before being sent to the client.

### 3. Usage in Controllers (`loginController.js`)

The `searchByLogin` function in `loginController.js` uses date normalization:

```javascript
const normalizedResults = await Promise.all(
  results.map(async (result, index) => {
    logger.info(`Normalizing result ${index + 1}/${results.length}`);
    const normalizedLogDate = await parseDate(result["Log date"]);
    const normalizedDate = await parseDate(result.Date);
    logger.info(`Normalized Log date: ${normalizedLogDate}`);
    logger.info(`Normalized Date: ${normalizedDate}`);
    return {
      ...result,
      "Log date": normalizedLogDate,
      Date: normalizedDate,
    };
  })
);
```

This ensures that both "Log date" and "Date" fields are normalized before being used for sorting or returned in the response.

## Handling Unrecognized Date Formats

When an unrecognized date format is encountered:

1. The original date string is returned unchanged.
2. A warning is logged.
3. The unrecognized format is logged to `/logs/new_date_formats.log` with a guessed format.

```javascript
async function logUnrecognizedFormat(dateString) {
  const logPath = path.join(__dirname, "../logs/new_date_formats.log");
  const guessedFormat = guessPossibleFormat(dateString);
  const logEntry = `${new Date().toISOString()}: Unrecognized format - ${dateString} (Possible format: ${guessedFormat})\n`;

  try {
    await fs.appendFile(logPath, logEntry);
  } catch (error) {
    logger.error(`Failed to log new date format: ${error}`);
  }
}
```

## Adding Support for New Date Formats

To add support for new date formats:

1. Regularly review the `/logs/new_date_formats.log` file.
2. Identify frequently occurring unrecognized formats.
3. Add new formats to the `KNOWN_LOG_DATE_FORMATS` array in `dateService.js`:

```javascript
const KNOWN_LOG_DATE_FORMATS = [
  // Existing formats...
  "new-format-string",
];
```

4. Test thoroughly with the new format added.
5. Deploy the updated `dateService.js` file.

## Best Practices

1. Always use the `parseDate` function from `dateService.js` when working with dates.
2. Regularly review and update the list of known date formats.
3. Monitor the `/logs/new_date_formats.log` file for new, unsupported formats.
4. When adding new date formats, ensure thorough testing across the application.
5. Consider the performance impact of adding too many date formats.
6. Keep the `moment` library up-to-date, as it's used in the `guessPossibleFormat` function.

## Conclusion

Date normalization is a critical component of our application, ensuring consistent and accurate date handling. By following this documentation and best practices, we can maintain and improve our date normalization process, leading to more reliable and consistent data throughout the application.

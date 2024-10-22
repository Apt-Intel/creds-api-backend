# Date Normalization Implementation

## Overview

Date normalization is a crucial part of our application, ensuring consistent date formats across different data sources and user inputs. This document outlines how date normalization is implemented, why it's necessary, and how it works within our codebase.

## Purpose

Date normalization is essential in our application to ensure consistent date representations across various data sources and user inputs. This consistency is crucial for:

1. Accurate sorting and filtering of data based on dates.
2. Consistent display of date information across the application.
3. Improved data quality and reduced errors in date-based operations.
4. Facilitating log analysis and user activity tracking.

## Relevant Files

1. [`services/dateService.js`](services/dateService.js): Core date parsing and normalization logic.
2. [`middlewares/dateNormalizationMiddleware.js`](middlewares/dateNormalizationMiddleware.js): Middleware for normalizing dates in responses.
3. [`controllers/loginController.js`](controllers/loginController.js): Utilizes date normalization in search results.
4. [`logs/new_date_formats.log`](logs/new_date_formats.log): Log file for unrecognized date formats.
5. [`app.js`](app.js): Application entry point where middleware is applied.

## Why Date Normalization?

Date normalization is essential because:

1. It ensures consistency in date representations across the application.
2. It helps in accurate sorting and filtering of data based on dates.
3. It improves data quality and reduces errors in date-based operations.

## How Date Normalization Works

### 1. Date Parsing Service (`dateService.js`)

The core of our date normalization is in [`services/dateService.js`](services/dateService.js). Here's how it works:

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

The `searchByLogin` function in [`controllers/loginController.js`](controllers/loginController.js) uses date normalization:

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
3. The unrecognized format is logged to [`logs/new_date_formats.log`](logs/new_date_formats.log) with a guessed format.

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

## Configuration

To add support for new date formats:

1. Open the `services/dateService.js` file.
2. Locate the `KNOWN_LOG_DATE_FORMATS` array.
3. Add the new format string to the array. For example:

```javascript
const KNOWN_LOG_DATE_FORMATS = [
  // Existing formats...
  "MM/dd/yyyy HH:mm:ss", // New format
];
```

4. Test thoroughly with the new format added.
5. Deploy the updated `dateService.js` file.

## Testing

To test the date normalization feature:

1. Use the `/api/json/v1/test-date-normalization` endpoint to verify various date formats.
2. Add new test cases in the `tests/dateService.test.js` file (if it exists).
3. Run the test suite using `npm test` command.

Example test case:

```javascript
test("parseDate correctly normalizes various formats", async () => {
  expect(await parseDate("17.05.2022 5:28:48")).toBe("2022-05-17 05:28:48");
  expect(await parseDate("2022-05-17T05:28:48.375Z")).toBe(
    "2022-05-17 05:28:48"
  );
  expect(await parseDate("5/17/2022 5:28:48 AM")).toBe("2022-05-17 05:28:48");
});
```

## Troubleshooting

Common issues:

1. Unrecognized date formats: Check the `logs/new_date_formats.log` file for any new, unsupported formats.
2. Parsing errors: Ensure that the input string matches one of the `KNOWN_LOG_DATE_FORMATS`.
3. Inconsistent output: Verify that the `parseDate` function is being used consistently across the application.

If you encounter issues, enable debug logging by setting the `LOG_LEVEL` environment variable to `debug`.

## Best Practices

1. Always use the `parseDate` function from [`services/dateService.js`](services/dateService.js) when working with dates.
2. Regularly review and update the list of known date formats.
3. Monitor the [`logs/new_date_formats.log`](logs/new_date_formats.log) file for new, unsupported formats.
4. When adding new date formats, ensure thorough testing across the application.
5. Consider the performance impact of adding too many date formats.
6. Keep the `moment` library up-to-date, as it's used in the `guessPossibleFormat` function.

## Performance Considerations

- The date normalization process can impact API response times, especially for large datasets.
- Consider implementing caching strategies for frequently accessed normalized dates.
- Monitor the performance impact of date normalization and optimize if necessary.

## Future Improvements

1. Implement a machine learning model to automatically detect and suggest new date formats.
2. Create a user interface for administrators to add and manage supported date formats.
3. Implement a more efficient date parsing algorithm to improve performance.

## Conclusion

Date normalization is a critical component of our application, ensuring consistent and accurate date handling. By following this documentation and best practices, we can maintain and improve our date normalization process, leading to more reliable and consistent data throughout the application.

## Additional Resources

- [Date-fns Documentation](https://date-fns.org/)
- [Moment.js Documentation](https://momentjs.com/)
- [JavaScript Date Object MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

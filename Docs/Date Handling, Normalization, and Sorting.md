# Date Handling, Normalization, and Sorting: A Comprehensive Guide for API Implementation

This document provides a detailed overview of how dates are handled, normalized, and sorted in our API.

## Overview

Our API implements a consistent approach to date handling across all routes, ensuring that dates are properly normalized and sorted according to user requests. This process is applied uniformly to both single and bulk search operations.

## Purpose

Date normalization is essential in our application to ensure consistent date representations across various data sources and user inputs. This consistency is crucial for:

1. Accurate sorting and filtering of data based on dates.
2. Consistent display of date information across the application.
3. Improved data quality and reduced errors in date-based operations.
4. Facilitating log analysis and user activity tracking.

## Components Involved

1. Controllers
2. Date Normalization Middleware
3. Sorting Middleware
4. Date Service
5. Domain Utils (for domain-specific operations)

## Relevant Files

1. `services/dateService.js`: Core date parsing and normalization logic.
2. `middlewares/dateNormalizationMiddleware.js`: Middleware for normalizing dates in responses.
3. `middlewares/sortingMiddleware.js`: Middleware for sorting normalized dates.
4. `controllers/loginController.js`: Controller for single login search.
5. `controllers/loginBulkController.js`: Controller for bulk login search.
6. `routes/api/v1/searchByLogin.js`: Routes for single login search.
7. `routes/api/v1/searchByLoginBulk.js`: Routes for bulk login search.
8. `logs/new_date_formats.log`: Log file for unrecognized date formats.

## Data Flow

### Single Search Routes (e.g., search-by-login, search-by-domain)

1. Controller (e.g., `loginController.js`, `domainController.js`)

   - Fetches data from the database
   - Stores results in `req.searchResults`
   - Does not perform any date operations

2. Date Normalization Middleware (`dateNormalizationMiddleware.js`)

   - Processes `req.searchResults`
   - Normalizes the "Log date" field in each result
   - Uses `parseDate` function from `dateService.js`

3. Sorting Middleware (`sortingMiddleware.js`)

   - Sorts the normalized results based on query parameters (`sortby` and `sortorder`)

4. Send Response Middleware
   - Sends the final sorted and normalized data

### Bulk Search Routes (e.g., search-by-login/bulk, search-by-domain/bulk)

1. Controller (e.g., `loginBulkController.js`, `domainBulkController.js`)

   - Fetches data for multiple queries
   - Stores results in `req.searchResults`
   - Does not perform any date operations

2. Date Normalization Middleware (`dateNormalizationMiddleware.js`)

   - Processes `req.searchResults`
   - Normalizes the "Log date" field in each result for each bulk query
   - Uses `parseDate` function from `dateService.js`

3. Sorting Middleware (`sortingMiddleware.js`)

   - Sorts the normalized results for each bulk query based on query parameters

4. Send Response Middleware
   - Sends the final sorted and normalized data

## Detailed Component Analysis

### Controllers

Controllers are responsible for fetching data from the database and preparing the initial response. They do not perform any date-related operations.

Example from `domainController.js`:

```js
const response = {
  total,
  page,
  results,
};
req.searchResults = response;
next();
```

### Date Normalization Middleware

Located in `dateNormalizationMiddleware.js`, this middleware normalizes dates in the `req.searchResults` object.

Key features:

- Recursively processes nested objects and arrays
- Normalizes "Log date" fields
- Handles both single and bulk search results
- Does not normalize the "Date" field

```js
const { parseDate } = require("../services/dateService");
const logger = require("../config/logger");
const normalizeData = async (data) => {
  if (Array.isArray(data)) {
    return Promise.all(data.map(normalizeData));
  }
  if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    if ("Log date" in newData) {
      newData["Log date"] = await parseDate(newData["Log date"]);
    }
    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = await Promise.all(newData.data.map(normalizeData));
    }
    if ("results" in newData && Array.isArray(newData.results)) {
      newData.results = await Promise.all(newData.results.map(normalizeData));
    }
    return newData;
  }
  return data;
};
const dateNormalizationMiddleware = async (req, res, next) => {
  logger.info("Date normalization middleware called");
  try {
    if (req.searchResults) {
      req.searchResults = await normalizeData(req.searchResults);
      logger.info("Date normalization completed");
    }
    next();
  } catch (error) {
    logger.error("Error in date normalization middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = dateNormalizationMiddleware;
```

### Sorting Middleware

Located in `sortingMiddleware.js`, this middleware sorts the normalized data based on query parameters.

Key features:

- Sorts based on "date_compromised" (Log date) or "date_uploaded" (Date)
- Handles both ascending and descending order
- Processes both single and bulk search results

```js
const logger = require("../config/logger");

const sortData = (data, sortBy, sortOrder) => {
  if (Array.isArray(data)) {
    return data.sort((a, b) => {
      const dateA = new Date(a[sortBy]);
      const dateB = new Date(b[sortBy]);
      const comparison = dateA - dateB;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  if (typeof data === "object" && data !== null) {
    const newData = { ...data };

    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = sortData(newData.data, sortBy, sortOrder);
    }

    if ("results" in newData && Array.isArray(newData.results)) {
      if (newData.results.length > 0 && "data" in newData.results[0]) {
        // Bulk search results
        newData.results = newData.results.map((result) => ({
          ...result,
          data: sortData(result.data, sortBy, sortOrder),
        }));
      } else {
        // Single search results
        newData.results = sortData(newData.results, sortBy, sortOrder);
      }
    }

    return newData;
  }

  return data;
};

const sortingMiddleware = (req, res, next) => {
  logger.info("Sorting middleware called");

  try {
    const sortBy = req.query.sortby || "date_compromised";
    const sortOrder = req.query.sortorder || "desc";
    const sortField = sortBy === "date_uploaded" ? "Date" : "Log date";

    logger.info(
      `Sorting parameters: sortBy=${sortField}, sortOrder=${sortOrder}`
    );

    if (req.searchResults) {
      req.searchResults = sortData(req.searchResults, sortField, sortOrder);
      logger.info("Sorting completed");
    }

    next();
  } catch (error) {
    logger.error("Error in sorting middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = sortingMiddleware;
```

### Date Service

Located in `dateService.js`, this service provides the core date parsing functionality.

Key features:

- Uses moment.js for flexible date parsing
- Attempts to parse dates using multiple known formats
- Logs unrecognized formats for future improvements
- Returns null for empty strings or invalid date strings
- Returns the original string if parsing fails

```js
const moment = require("moment");
const logger = require("../config/logger");
const fs = require("fs").promises;
const path = require("path");

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

function tryParseDateWithMultipleMethods(dateString) {
  // Method 1: Moment with known formats (strict parsing)
  for (const format of KNOWN_LOG_DATE_FORMATS) {
    const parsedDate = moment(dateString, format, true);
    if (parsedDate.isValid()) {
      logger.debug(`Parsed date using format: ${format}`);
      return parsedDate;
    }
  }

  // Method 2: Native Date parsing
  const nativeDate = new Date(dateString);
  if (!isNaN(nativeDate.getTime())) {
    logger.debug("Parsed date using native Date");
    return moment(nativeDate);
  }

  // Method 3: Moment's flexible parsing (as a last resort)
  const flexibleParsedDate = moment(dateString);
  if (flexibleParsedDate.isValid()) {
    logger.debug("Parsed date using Moment's flexible parsing");
    return flexibleParsedDate;
  }

  logger.debug(`Failed to parse date: ${dateString}`);
  return null;
}

async function parseDate(dateString) {
  if (!dateString) return null;
  const normalizedDateString = dateString.toLowerCase().trim();
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

module.exports = {
  parseDate,
};
```

## Sorting Behavior: "date_compromised" vs "date_uploaded"

Our API supports two sorting options: "date_compromised" and "date_uploaded". Here's how they differ:

1. "date_compromised" (default):

   - Uses the "Log date" field
   - This field goes through the date normalization process
   - Represents when the credentials were compromised
   - May have various initial formats, which are normalized

2. "date_uploaded":
   - Uses the "Date" field
   - This field does not go through the normalization process
   - Represents when the data was uploaded to the database
   - Assumed to be in a consistent "YYYY-MM-DD HH:mm:ss" format

The sorting logic in the middleware is the same for both options, but they operate on different fields.

## Domain-Specific Handling

For domain-related endpoints, additional sanitization is performed using `domainUtils.js`:

```js
async function sanitizeDomain(input) {
  // ... (input validation)
  // Remove common prefixes
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
  // Parse the domain
  const parsedDomain = parse(domain);
  if (!parsedDomain.domain) {
    return null;
  }
  // Convert Punycode domains to Unicode
  domain = punycode.toUnicode(parsedDomain.domain);
  // Validate the domain format
  const domainRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
  if (!domainRegex.test(domain)) {
    return null;
  }
  // ... (caching)
  return domain;
}
```

This ensures that domains are properly sanitized before being used in database queries.

## Handling Unrecognized Date Formats

When an unrecognized date format is encountered:

1. The original date string is returned unchanged.
2. A warning is logged.
3. The unrecognized format is logged to `logs/new_date_formats.log` with a guessed format.

## Adding New Date Formats

To add support for new date formats:

1. Open the `services/dateService.js` file.
2. Locate the `KNOWN_LOG_DATE_FORMATS` array.
3. Add the new format string to the array.
4. Update the `guessPossibleFormat` function to include the new format.
5. Test thoroughly with the new format added.

## Date Normalization and Sorting: Input and Output Examples

### Date Normalization Example

#### Input (raw data from database):

```json
{
  "results": [
    {
      "Log date": "17.05.2022 5:28:48",
      "Date": "2022-05-17",
      "other_field": "some value"
    },
    {
      "Log date": "2022-05-18T10:15:30.000Z",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "5/19/2022 2:45:00 PM",
      "Date": "2022-05-19",
      "other_field": "third value"
    }
  ]
}
```

#### Output (after date normalization):

```json
{
  "results": [
    {
      "Log date": "2022-05-17T05:28:48.000Z",
      "Date": "2022-05-17",
      "other_field": "some value"
    },
    {
      "Log date": "2022-05-18T10:15:30.000Z",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "2022-05-19T14:45:00.000Z",
      "Date": "2022-05-19",
      "other_field": "third value"
    }
  ]
}
```

### Sorting Example

#### Input (normalized data):

```json
{
  "results": [
    {
      "Log date": "2022-05-17T05:28:48.000Z",
      "Date": "2022-05-17",
      "other_field": "some value"
    },
    {
      "Log date": "2022-05-18T10:15:30.000Z",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "2022-05-19T14:45:00.000Z",
      "Date": "2022-05-19",
      "other_field": "third value"
    }
  ]
}
```

#### Output (sorted by "Log date" in descending order):

```json
{
  "results": [
    {
      "Log date": "2022-05-19T14:45:00.000Z",
      "Date": "2022-05-19",
      "other_field": "third value"
    },
    {
      "Log date": "2022-05-18T10:15:30.000Z",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "2022-05-17T05:28:48.000Z",
      "Date": "2022-05-17",
      "other_field": "some value"
    }
  ]
}
```

## Implementing Date Normalization and Sorting in a New Endpoint

Here's a complete example of how to implement date normalization and sorting in a new endpoint:

### 1. Route Definition (routes/api/v1/newEndpoint.js)

```js
const express = require("express");
const router = express.Router();
const {
  newEndpointController,
} = require("../../../controllers/v1/newEndpointController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.get(
  "/new-endpoint",
  newEndpointController,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

### 2. Controller Function (controllers/v1/newEndpointController.js)

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");

async function newEndpointController(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const someParameter = req.query.someParameter;

  logger.info(
    `New endpoint called with parameter: ${someParameter}, page: ${page}`
  );

  try {
    const db = await getDatabase();
    const collection = db.collection("your_collection_name");
    const query = {
      /* Your query here */
    };
    const { limit, skip } = getPaginationParams(page);
    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    const response = {
      total,
      page,
      results,
    };

    logger.info(`New endpoint search completed, total results: ${total}`);

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in newEndpointController:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  newEndpointController,
};
```

### 3. Middleware Chain

The middleware chain in the route definition ensures that:

1. The controller function fetches the data and stores it in `req.searchResults`.
2. The `dateNormalizationMiddleware` normalizes any "Log date" fields in the results.
3. The `sortingMiddleware` sorts the normalized data based on query parameters.
4. The `sendResponseMiddleware` sends the final, processed response.

By following this pattern, you can easily implement date normalization and sorting in any new endpoint you create.

## Efficiency and Performance Considerations

1. Caching: Domain sanitization results are cached using LRU cache to improve performance for repeated queries.
2. Asynchronous Operations: Date parsing and domain sanitization are performed asynchronously to prevent blocking the event loop.
3. Single Pass: Date normalization and sorting occur exactly once per request, avoiding redundant operations.

## Conclusion

The current implementation ensures consistent and efficient date handling across all API routes. Date normalization occurs only for the "Log date" field, while sorting can be performed on either "Log date" or "Date" fields. This approach provides flexibility for different use cases while maintaining data integrity.

## Recommendations

1. Implement unit tests for date normalization and sorting processes to ensure continued accuracy.
2. Regularly review the `new_date_formats.log` to identify and add new date formats as needed.
3. Consider normalizing the "Date" field as well, for consistency and to prevent potential issues.
4. Monitor the performance of date operations, especially for large bulk requests, and optimize if necessary.
5. Periodically update the `KNOWN_LOG_DATE_FORMATS` array in `dateService.js` based on the formats found in `new_date_formats.log`.
6. Add documentation to clarify the difference between "date_compromised" and "date_uploaded" sorting options for API users.
7. Ensure that the "Date" field is always in a consistent format when data is inserted into the database.
8. When adding new date formats, ensure thorough testing across the application.
9. Consider the performance impact of adding too many date formats.
10. Use logging in the date normalization and sorting middlewares to track their execution and help with debugging.
11. When implementing new features that involve dates, ensure they work correctly with the existing date normalization and sorting flow.
12. For bulk operations, make sure the date normalization and sorting are applied correctly to nested data structures.

## Best Practices

1. Always use the `parseDate` function from `services/dateService.js` when working with dates.
2. Regularly review and update the list of known date formats.
3. Monitor the `logs/new_date_formats.log` file for new, unsupported formats.
4. When adding new date formats, ensure thorough testing across the application.
5. Consider the performance impact of adding too many date formats.
6. Use logging in the date normalization and sorting middlewares to track their execution and help with debugging.
7. When implementing new features that involve dates, ensure they work correctly with the existing date normalization and sorting flow.
8. For bulk operations, make sure the date normalization and sorting are applied correctly to nested data structures.

By following these guidelines and using the updated middleware chain, you can ensure consistent date handling across the application, improving data quality and user experience.

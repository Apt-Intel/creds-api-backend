# Project Specification Document

## Project Overview

You are building a continuously augmented cybercrime API composed of millions of machine credentials compromised by info-stealers in global malware-spreading campaigns. It provides clients the ability to query a MongoDB database of over **29,919,523** computers compromised through global info-stealer campaigns performed by threat actors. The database is updated daily with new compromised computers, offering cybersecurity providers the ability to alert security teams ahead of imminent attacks when users get compromised and have their credentials stolen.

## Dependencies and Technologies

This document provides an overview of the packages, libraries, and technologies used in the project, along with a brief description of their usage and where they are implemented.

### Dependencies

#### 1. `cls-hooked`

- **Version**: ^4.2.2
- **Usage**: Provides continuation-local storage, allowing you to maintain context across asynchronous calls.
- **Location**: Used in various parts of the application to maintain context, especially in logging and request tracking.

#### 2. `cors`

- **Version**: ^2.8.5
- **Usage**: Enables Cross-Origin Resource Sharing (CORS) for the API, allowing it to handle requests from different origins.
- **Location**: Configured in `app.js` to handle CORS settings for the API.

#### 3. `date-fns`

- **Version**: ^2.30.0
- **Usage**: Provides utility functions for date manipulation and formatting.
- **Location**: Used in `dateNormalizationMiddleware.js` and other parts of the application for date normalization and formatting.

#### 4. `dotenv`

- **Version**: ^16.3.1
- **Usage**: Loads environment variables from a `.env` file into `process.env`
- **Location**: Configured in `app.js` and other configuration files like `database.js`

#### 5. `express`

- **Version**: ^4.18.2
- **Usage**: Web framework for building the API.
- **Location**: Core framework used in `app.js` to define routes, middlewares, and server configuration.

#### 6. `express-rate-limit`

- **Version**: ^6.7.1
- **Usage**: Middleware to limit repeated requests to public APIs.
- **Location**: Configured in `app.js` to prevent abuse and ensure fair usage of the API.

#### 7. `helmet`

- **Version**: ^4.6.0
- **Usage**: Helps secure the application by setting various HTTP headers.
- **Location**: Configured in `app.js` to enhance security.

#### 8. `moment`

- **Version**: ^2.30.1
- **Usage**: Library for parsing, validating, manipulating, and formatting dates.
- **Location**: Used in various parts of the application for date manipulation.

#### 9. `mongodb`

- **Version**: ^5.6.0
- **Usage**: MongoDB driver for Node.js.
- **Location**: Used in `database.js` to connect and interact with MongoDB.

#### 10. `mongoose`

- **Version**: ^8.7.2
- **Usage**: MongoDB object modeling tool designed to work in an asynchronous environment.
- **Location**: Used in `database.js` for schema definitions and database interactions.

#### 11. `morgan`

- **Version**: ^1.10.0
- **Usage**: HTTP request logger middleware for Node.js.
- **Location**: Configured in `app.js` for logging HTTP requests.

#### 12. `punycode`

- **Version**: ^2.3.1
- **Usage**: Provides utilities for converting between Unicode and Punycode.
- **Location**: Used in various parts of the application for handling domain names.

#### 13. `redis`

- **Version**: ^3.1.2
- **Usage**: Redis client for Node.js.
- **Location**: Used in `redisClient.js` for caching and other Redis operations.

### 14. `uuid`

- **Version**: ^10.0.0
- **Usage**: Generates RFC-compliant UUIDs.
- **Location**: Used in various parts of the application for generating unique identifiers.

### 15. `winston`

- **Version**: ^3.9.0
- **Usage**: Logging library for Node.js.
- **Location**: Configured in `logger.js` for logging application events.

### 16. `winston-daily-rotate-file`

- **Version**: ^5.0.0
- **Usage**: Transport for winston that logs to a rotating file each day.
- **Location**: Used in `logger.js` to manage log files.

## DevDependencies

### 1. `jest`

- **Version**: ^29.5.0
- **Usage**: JavaScript testing framework.
- **Location**: Used in the `__tests__` directory for writing and running unit tests.

### 2. `nodemon`

- **Version**: ^3.1.7
- **Usage**: Utility that monitors for changes in the source code and automatically restarts the server.
- **Location**: Used during development to automatically restart the server on code changes.

## Technologies

### 1. **Node.js**

- **Usage**: JavaScript runtime environment used to build the backend of the application.
- **Location**: Core technology for the entire project.

### 2. **MongoDB**

- **Usage**: NoSQL database used to store application data.
- **Location**: Configured in `database.js` and connected using Mongoose.

### 3. **Redis**

- **Usage**: In-memory data structure store used for caching and other purposes.
- **Location**: Configured in `redisClient.js`

### 4. **Express**

- **Usage**: Web framework for building the API.
- **Location**: Core framework used in `app.js`

### 5. **Jest**

- **Usage**: Testing framework for writing and running tests.
- **Location**: Used in the `__tests__` directory.

### 6. **Docker**

- **Usage**: Containerization platform to package the application and its dependencies.
- **Location**: Docker configuration files (if any) and Docker commands used in deployment scripts.

### 7. **Git**

- **Usage**: Version control system for tracking changes in the source code.
- **Location**: `.gitignore` file and Git commands used for version control.

### 8. **VS Code**

- **Usage**: Integrated Development Environment (IDE) for writing and editing code.
- **Location**: `.vscode` directory (if any) and VS Code-specific configuration files.

## Current File Structure

```
creds-api-backend/
├── Docs
│   ├── API Documentation.md
│   ├── API Endpoints Implementation.md
│   ├── Date Normatization Implementation.md
│   ├── Logging Implementation.md
│   └── Redis Implementation.md
├── __tests__
│   ├── dateService.test.js
│   └── loginController.test.js
├── app.js
├── config
│   ├── database.js
│   ├── logger.js
│   └── redisClient.js
├── controllers
│   └── loginController.js
├── database.js
├── logs
│   ├── application
│   │   ├── application-2024-10-21.log
│   │   └── application-2024-10-22.log
│   ├── combined
│   │   └── combined.log
│   ├── date_parsing
│   │   └── date_parsing_errors.log
│   ├── errors
│   │   ├── error-2024-10-21.log
│   │   └── error-2024-10-22.log
│   └── new_date_formats
│       └── new_date_formats.log
├── middlewares
│   ├── authMiddleware.js
│   ├── complexRateLimitMiddleware.js
│   ├── dateNormalizationMiddleware.js
│   ├── rateLimitMiddleware.js
│   └── requestIdMiddleware.js
├── package-lock.json
├── package.json
├── routes
│   └── api
│       └── v1
│           └── searchByLogin.js
├── sample.json
├── services
│   └── dateService.js
├── test.js
├── tests
│   └── loadTest.js
└── utils
    └── paginationUtils.js
```

## Database Schema Reference

To understand the data structure, here's an example entry from the database for schema reference:

```json
{
  "_id": "hetzwRf4m-64bd57e730de2dbb8183fa8a",
  "Stealer Type": "RedLine",
  "Folder Name": "CLE8092C7AD8A33B6B471EC5F4B8828DC6_2022_05_17T05_28_48_375121",
  "Date": "2023-07-23 09:38:30",
  "Has Screenshot": true,
  "Has Cookies": true,
  "Build ID": "Build#10k",
  "IP": "127.0.0.1",
  "FileLocation": "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\AppLaunch.exe",
  "UserName": "natal",
  "Country": "CL",
  "Postal Code": "1700000",
  "Location": "La Serena, Coquimbo",
  "HWID": "E8092C7AD8A33B6B471EC5F4B8828DC6",
  "Current Language": "Spanish (Spain, International Sort)",
  "TimeZone": "(UTC-04:00) Santiago",
  "Operating System": "Windows 10 Home x64",
  "UAC": "AllowAll",
  "Process Elevation": "False",
  "Log date": "17.05.2022 5:28:48",
  "Keyboard Layouts": "Spanish (Spain, International Sort)",
  "CPU": "Intel(R) Core(TM) i5-10300H CPU @ 2.50GHz, 4 Cores",
  "Anti-Viruses": "Windows Defender",
  "Credentials": [
    {
      "URL": "https://test.com/",
      "Username": "testname",
      "Password": "testpass",
      "Application": "Opera GX_Unknown"
    }
  ],
  "Hash": "00004f5977440098482fcfe5712bb9a803babade75e009a947e252808c85b2b1",
  "Usernames": ["test@gmail.com", "test", "name", "123username"]
}
```

Note: The `Usernames` array is now used for searching instead of `Credentials.Username` because its Indexed and more efficient.

## Implemented Features

1. **MongoDB Connection**: Implemented in `config/database.js`.
2. **Authentication**: API key-based authentication implemented in `middlewares/authMiddleware.js`.
3. **Rate Limiting**: Implemented in `middlewares/complexRateLimitMiddleware.js`.
4. **Search by Login**: Implemented in `controllers/loginController.js`.
5. **Date Normalization**: Implemented in `services/dateService.js` and `middlewares/dateNormalizationMiddleware.js`.
6. **Pagination**: Implemented in `utils/paginationUtils.js`.
7. **Logging**: Implemented using Winston in `config/logger.js`.

## Relevant Documentations

### API Documentation

#### 1. Search by Login

##### Endpoint

`GET /api/json/v1/search-by-login`
`POST /api/json/v1/search-by-login`

##### Description

Search for user login information based on query parameters or request body.

##### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `login`              | String  | Yes      | The login username to search for.                                              |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: 1                                     |
| `installed_software` | Boolean | No       | Filter by installed software. Default: false                                   |

##### Example Request

GET /api/json/v1/search-by-login?login=example@email.com&sortby=date_uploaded&sortorder=asc&page=1

##### Example Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Usernames": "example@email.com",
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z"
      // Other fields...
    }
    // More results...
  ]
}
```

##### Errors

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Login parameter is required |
| 401         | Unauthorized - Invalid or missing API key |
| 429         | Too Many Requests - Rate limit exceeded   |
| 500         | Internal Server Error                     |

#### 2. Test Date Normalization

##### Endpoint

`GET /api/json/v1/test-date-normalization`

##### Description

Test endpoint to verify date normalization functionality.

##### Example Response

```json
{
  "testLogDate1": "2022-05-17T05:28:48.000Z",
  "testLogDate2": "2022-05-17T05:28:48.375Z",
  "testLogDate3": "2022-05-17T05:28:48.000Z",
  "Date": "2023-10-21 14:30:00",
  "nonDateField": "This is not a date"
}
```

#### Authentication

All endpoints (except `/health`) require an API key to be provided in the request headers.

##### Header

api-key: YOUR_API_KEY

#### Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 50 requests per 10-second window

Rate limit information is provided in the response headers:

`X-RateLimit-Limit: 50`
`X-RateLimit-Remaining: 49`
`X-RateLimit-Reset: 9`

#### Pagination

Results are paginated with a default page size of 50 items. Use the `page` query parameter to navigate through pages.

#### Date Normalization

The API automatically normalizes dates in the "Log date" field to ISO 8601 format (UTC) for consistency.

#### Error Responses

Error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

#### Health Check

##### Endpoint

`GET /health`

##### Description

Check the health status of the API.

##### Example Response

```json
{
  "status": "OK"
}
```

This endpoint does not require authentication and is not subject to rate limiting.

#### Conclusion

This documentation covers the main endpoints, authentication, rate limiting, pagination, date normalization, and error handling based on the provided code files. It includes the search by login functionality, the test date normalization endpoint, and the health check endpoint. The format follows the structure you provided, with additional sections for general API features.

———

### API Endpoints and Routes Documentation

This document provides a detailed overview of the API endpoints, routes, middlewares, and controllers in the application. It also includes guidelines for implementing new API routes, controllers, and middlewares.

#### 1. API Versioning

Our API uses versioning to ensure backward compatibility as we evolve the API. The current version is v1, which is reflected in the URL structure: `/api/v1/`.

#### 2. API Endpoints and Routes Implementation

API endpoints and routes are defined in the `routes` directory. Each route file corresponds to a specific feature or resource.

Example: `searchByLogin.js`

```js
const express = require("express");
const router = express.Router();
const { searchByLogin } = require("../../../controllers/loginController");

router.get("/search-by-login", searchByLogin);
router.post("/search-by-login", searchByLogin);

// Make sure this test route is present
router.get("/test-date-normalization", (req, res) => {
  res.json({
    testDate1: "2023-07-23 09:38:30",
    testDate2: "17.05.2022 5:28:48",
    testDate3: "2022-05-17T05:28:48.375Z",
    nonDateField: "This is not a date",
  });
});

module.exports = router;
```

##### 2.1 Search By Login Endpoint

- **URL**: `/api/v1/search-by-login`
- **Methods**: GET, POST
- **Auth Required**: Yes
- **Query Parameters**:
  - `login` (required): The username to search for
  - `sortby` (optional): Field to sort by. Options: "date_compromised" (default), "date_uploaded"
  - `sortorder` (optional): Sort order. Options: "desc" (default), "asc"
  - `page` (optional): Page number for pagination. Default: 1
  - `installed_software` (optional): Boolean flag for installed software. Default: false

**Example Request:**

```
GET /api/v1/search-by-login?login=johndoe&sortby=date_uploaded&sortorder=asc&page=1
```

**Example Response:**

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Usernames": "johndoe",
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z"
      // Other fields...
    }
    // More results...
  ]
}
```

#### 3. Middlewares Implementation

Middlewares are implemented in the `middlewares` directory. They are used for tasks such as authentication, rate limiting, and logging.

Example: `authMiddleware.js`

```js
const logger = require("../config/logger");
const { asyncRedis } = require("../config/redisClient");

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header("api-key");
    logger.info(`Received API key: ${apiKey}`);

    if (!apiKey) {
      logger.warn("No API key provided");
      return res.status(401).json({ error: "API key is required" });
    }

    const isValid = apiKey === process.env.API_KEY;
    logger.info(`API key validation result: ${isValid}`);

    if (isValid) {
      await asyncRedis.setex(`api_key:${apiKey}`, 3600, "valid");
      logger.info("Valid API key cached");
      next();
    } else {
      await asyncRedis.setex(`api_key:${apiKey}`, 300, "invalid");
      logger.warn("Invalid API key cached");
      res.status(401).json({ error: "Invalid API key" });
    }
  } catch (error) {
    logger.error("Error in auth middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authMiddleware;
```

##### 3.1 Authentication

The `authMiddleware` checks for a valid API key in the request headers. To use the API, clients must include their API key in the `api-key` header of each request.

**Example:**

```
Headers:
api-key: your_api_key_here
```

If the API key is missing or invalid, the middleware will return a 401 Unauthorized response.

#### 4. Controllers Implementation

Controllers are implemented in the `controllers` directory. They handle the business logic for each route.

Example: `loginController.js`

```js
const { getDatabase } = require("../config/database");
const logger = require("../config/logger");
const { parseDate } = require("../services/dateService");
const { getPaginationParams } = require("../utils/paginationUtils");

async function searchByLogin(req, res) {
  const login = req.body.login || req.query.login;
  const sortBy = req.query.sortby || "date_compromised";
  const sortOrder = req.query.sortorder || "desc";
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";

  logger.info(`Searching for login: ${login}`);
  logger.info(
    `Query params: sortby=${sortBy}, sortorder=${sortOrder}, page=${page}, installed_software=${installedSoftware}`
  );

  if (!login) {
    return res.status(400).json({ error: "Login parameter is required" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query = { Usernames: login };
    const sort = {};
    if (sortBy === "date_uploaded") {
      sort.Date = sortOrder === "asc" ? 1 : -1;
    } else {
      sort["Log date"] = sortOrder === "asc" ? 1 : -1;
    }

    const { limit, skip } = getPaginationParams(page);

    const [results, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    logger.info("Normalizing results...");
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

    // Sort the normalized results in memory to ensure correct ordering
    normalizedResults.sort((a, b) => {
      const dateA = sortBy === "date_uploaded" ? a.Date : a["Log date"];
      const dateB = sortBy === "date_uploaded" ? b.Date : b["Log date"];
      return sortOrder === "asc"
        ? new Date(dateA) - new Date(dateB)
        : new Date(dateB) - new Date(dateA);
    });

    const response = {
      total,
      page,
      results: normalizedResults,
    };

    res.json(response);
  } catch (error) {
    logger.error("Error in searchByLogin:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByLogin,
};
```

#### 5. Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. Common error codes include:

- 400 Bad Request: Invalid input parameters
- 401 Unauthorized: Missing or invalid API key
- 500 Internal Server Error: Unexpected server error

Error responses include a JSON body with an `error` field describing the error.

#### 6. Pagination

The API supports pagination for endpoints that return multiple results. Use the `page` query parameter to specify the desired page. The response includes `total` (total number of results) and `page` (current page number) fields.

#### 7. Data Normalization

The API normalizes date fields ("Log date" and "Date") to ensure consistent formatting. Dates are returned in ISO 8601 format (e.g., "2023-07-23T09:38:30.000Z").

#### 8. Guidelines for Implementing New API Routes

1. Create a new file in the `routes/api/v1` directory.
2. Define the route using Express.
3. Apply necessary middlewares (e.g., authentication).
4. Call the appropriate controller function.

Example:

```js
const express = require("express");
const router = express.Router();
const { newController } = require("../../../controllers/newController");
const authMiddleware = require("../../../middlewares/authMiddleware");

router.get("/new-route", authMiddleware, newController);

module.exports = router;
```

#### 9. Code Structure

The code follows a modular structure with separate directories for routes, controllers, middlewares, and configuration files.

```
├── config/
│   ├── database.js
│   ├── logger.js
│   └── redisClient.js
├── controllers/
│   └── loginController.js
├── middlewares/
│   ├── authMiddleware.js
│   └── rateLimitMiddleware.js
├── routes/
│   └── api/
│       └── v1/
│           └── searchByLogin.js
├── app.js
└── package.json
```

#### 10. Best Practices

- Use meaningful HTTP methods (GET, POST, PUT, DELETE) for different operations.
- Implement proper error handling and logging in all controllers and middlewares.
- Use environment variables for configuration and sensitive information.
- Follow RESTful naming conventions for endpoints.
- Implement input validation for all incoming data.
- Use the logger for consistent logging across the application:

```js
const logger = require("../config/logger");
logger.info("This is an info message");
```

- Store sensitive information like API keys in the `.env` file:

```
API_KEY=your_api_key
```

- Ensure proper error handling in controllers and middlewares:

```js
try {
  // Business logic
} catch (error) {
  logger.error("Error message:", error);
  res.status(500).json({ error: "Internal server error" });
}
```

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application.

———

### Date Normalization Implementation

#### Overview

Date normalization is a crucial part of our application, ensuring consistent date formats across different data sources and user inputs. This document outlines how date normalization is implemented, why it's necessary, and how it works within our codebase.

#### Purpose

Date normalization is essential in our application to ensure consistent date representations across various data sources and user inputs. This consistency is crucial for:

1. Accurate sorting and filtering of data based on dates.
2. Consistent display of date information across the application.
3. Improved data quality and reduced errors in date-based operations.
4. Facilitating log analysis and user activity tracking.

#### Relevant Files

1. [`services/dateService.js`](services/dateService.js): Core date parsing and normalization logic.
2. [`middlewares/dateNormalizationMiddleware.js`](middlewares/dateNormalizationMiddleware.js): Middleware for normalizing dates in responses.
3. [`controllers/loginController.js`](controllers/loginController.js): Utilizes date normalization in search results.
4. [`logs/new_date_formats.log`](logs/new_date_formats.log): Log file for unrecognized date formats.
5. [`app.js`](app.js): Application entry point where middleware is applied.

#### Why Date Normalization?

Date normalization is essential because:

1. It ensures consistency in date representations across the application.
2. It helps in accurate sorting and filtering of data based on dates.
3. It improves data quality and reduces errors in date-based operations.

#### How Date Normalization Works

##### 1. Date Parsing Service (`dateService.js`)

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

##### 2. Date Normalization Middleware (`dateNormalizationMiddleware.js`)

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

##### 3. Usage in Controllers (`loginController.js`)

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

#### Handling Unrecognized Date Formats

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

#### Configuration

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

#### Testing

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

#### Troubleshooting

Common issues:

1. Unrecognized date formats: Check the `logs/new_date_formats.log` file for any new, unsupported formats.
2. Parsing errors: Ensure that the input string matches one of the `KNOWN_LOG_DATE_FORMATS`.
3. Inconsistent output: Verify that the `parseDate` function is being used consistently across the application.

If you encounter issues, enable debug logging by setting the `LOG_LEVEL` environment variable to `debug`.

#### Best Practices

1. Always use the `parseDate` function from [`services/dateService.js`](services/dateService.js) when working with dates.
2. Regularly review and update the list of known date formats.
3. Monitor the [`logs/new_date_formats.log`](logs/new_date_formats.log) file for new, unsupported formats.
4. When adding new date formats, ensure thorough testing across the application.
5. Consider the performance impact of adding too many date formats.
6. Keep the `moment` library up-to-date, as it's used in the `guessPossibleFormat` function.

#### Performance Considerations

- The date normalization process can impact API response times, especially for large datasets.
- Consider implementing caching strategies for frequently accessed normalized dates.
- Monitor the performance impact of date normalization and optimize if necessary.

#### Conclusion

Date normalization is a critical component of our application, ensuring consistent and accurate date handling. By following this documentation and best practices, we can maintain and improve our date normalization process, leading to more reliable and consistent data throughout the application.

———

### Logging Implementation Documentation

#### 1. How is Logging Implemented in This Codebase?

Logging in this codebase is implemented using the `winston` library with the `winston-daily-rotate-file` transport for log rotation. The logger is configured and initialized in the `config/logger.js` file. The logger is then used throughout the application to log various levels of messages, such as `info`, `error`, and `debug`.

#### 2. What Structure Does It Follow?

The logging implementation follows a modular structure:

- `config/logger.js`: Initializes and exports the logger with various configurations.
- `middlewares/requestIdMiddleware.js`: Provides a namespace for request IDs used in logging.

The logging system uses the following directory structure:

```
├── application/
│ ├── application-YYYY-MM-DD.log
│ ├── application-YYYY-MM-DD.log.gz (for older, compressed logs)
│ └── .[hash]-audit.json
├── errors/
│ ├── error-YYYY-MM-DD.log
│ ├── error-YYYY-MM-DD.log.gz (for older, compressed logs)
│ └── .[hash]-audit.json
├── combined/
│ └── combined.log
├── date_parsing/
│ └── date_parsing_errors.log
└── new_date_formats/
  └── new_date_formats.log
```

The `.audit.json` files are created and managed by the `winston-daily-rotate-file` transport to keep track of the log files.

#### 3. Guidelines for Using Logging for New Features

When adding new features that require logging, follow these guidelines:

1. **Log Levels**: Use appropriate log levels (`info`, `error`, `debug`, etc.) based on the environment and importance of the message.
2. **Request IDs**: Include request IDs in log messages for better traceability.
3. **Error Handling**: Ensure proper error handling when logging errors to avoid application crashes.
4. **Environment-Based Logging**: Adjust log levels based on the environment using the `getLogLevel` function.

#### 4. Implementation Details

##### Logger Initialization

The logger is initialized in `config/logger.js`:

```javascript
const winston = require("winston");
const path = require("path");
const { namespace } = require("../middlewares/requestIdMiddleware");
const { v4: uuidv4 } = require("uuid");
require("winston-daily-rotate-file");
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
// ... (rest of the configuration)
```

##### Environment-Based Log Levels

The `getLogLevel` function determines the appropriate log level based on the current environment:

```javascript
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
```

This ensures that logging is optimized for each environment, with more verbose logging in development and less in production.

##### Log Rotation

We use `winston-daily-rotate-file` for log rotation:

```javascript
const applicationLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "application", "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});
```

This configuration rotates log files daily, compresses old logs, and maintains logs for up to 14 days.

##### Using the Logger

To use the logger in your code, import it from `config/logger.js`:

```javascript
const logger = require("../config/logger");

logger.info("This is an info message");
logger.error("This is an error message");
logger.debug("This is a debug message");
```

##### Logging with Request ID

To log messages with a request ID, use the `logWithRequestId` method:

```javascript
logger.logWithRequestId("info", "This is an info message with request ID");
```

##### Error Logging

A separate file is used for error logs:

```javascript
const errorLogTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "errors", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});
```

This ensures that error logs are easily accessible and don't get mixed with other log levels.

##### System Request ID

A `systemRequestId` is generated to ensure that all logs have a request ID, even if not provided by the request middleware:

```javascript
const systemRequestId = uuidv4();
```

#### 5. Best Practices

1. Always use the appropriate log level (`info`, `warn`, `error`, `debug`) based on the nature of the message.
2. Include relevant context in log messages, such as function names, input parameters, or error details.
3. Use structured logging (objects) when possible for easier parsing and analysis.
4. Avoid logging sensitive information like passwords or API keys.

#### 6. Troubleshooting

- If logs are not appearing, check the log level set by the environment variable.
- Ensure that the log directory exists and has proper write permissions.
- For performance issues, consider adjusting the log levels in production.
- Check the `error.log` file for any logging-related errors.

#### 7. Performance Considerations

- In production, set the log level to "warn" or "error" to minimize I/O operations.
- Use async logging when possible to avoid blocking the main thread.
- Consider implementing log buffering for high-traffic applications.

———

### Redis Usage Documentation

#### Introduction

Redis is implemented in this codebase primarily for caching and rate limiting purposes. It provides fast, in-memory data storage that helps improve the application's performance and scalability. Redis is particularly useful for storing temporary data like API key validation results and managing rate limiting counters.

#### 1. How is Redis Implemented in This Codebase?

Redis is implemented using the `redis` npm package. The Redis client is configured and initialized in the `redisClient.js` file. This client is then used in various middlewares and services to store and retrieve data.

##### Redis Data Structures Used

- **Strings**: Used for caching API key validation results.
- **Sorted Sets**: Used for implementing a sliding window rate limiting algorithm.

#### 2. What Structure Does It Follow?

The Redis implementation follows a modular structure where the Redis client and its asynchronous methods are encapsulated in a separate module. This module is then imported and used in other parts of the application as needed.

##### File Structure:

- `redisClient.js`: Initializes and exports the Redis client and asynchronous methods.
- `complexRateLimitMiddleware.js`: Uses Redis for rate limiting.
- `authMiddleware.js`: Uses Redis for caching API key validation results.

#### 3. Guidelines for Using Redis for New Features

When adding new features that require Redis, follow these guidelines:

1. **Encapsulation**: Always encapsulate Redis operations in a separate module or service.
2. **Error Handling**: Ensure proper error handling when interacting with Redis.
3. **Namespace Keys**: Use a consistent naming convention for Redis keys to avoid collisions.
4. **TTL (Time to Live)**: Set appropriate TTL values for cached data.
5. **Asynchronous Operations**: Use asynchronous methods for Redis operations.
6. **Choose Appropriate Data Structures**: Select the most suitable Redis data structure for your use case.

#### 4. Implementation Details and Code Snippets

##### Redis Client Initialization

```js
const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

const asyncRedis = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  setex: promisify(client.setex).bind(client),
  del: promisify(client.del).bind(client),
  incr: promisify(client.incr).bind(client),
  expire: promisify(client.expire).bind(client),
};

module.exports = { client, asyncRedis };
```

##### Rate Limiting Middleware

The `complexRateLimitMiddleware` uses Redis sorted sets to implement a sliding window rate limiting algorithm:

```js
const complexRateLimitMiddleware = async (req, res, next) => {
  const apiKey = req.header("api-key");
  const ip = req.ip;

  try {
    const [apiKeyResult, ipResult] = await Promise.all([
      checkRateLimit(`rate_limit:${apiKey}`),
      checkRateLimit(`rate_limit:${ip}`),
    ]);

    const remaining = Math.min(apiKeyResult.remaining, ipResult.remaining);
    const resetTime = Math.max(apiKeyResult.resetTime, ipResult.resetTime);

    res.set({
      "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW,
      "X-RateLimit-Remaining": remaining,
      "X-RateLimit-Reset": resetTime,
    });

    if (remaining < 0) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    next();
  } catch (error) {
    logger.error("Error in rate limit middleware:", error);
    next(error);
  }
};

async function checkRateLimit(key) {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE_IN_SECONDS * 1000;

  const multi = client.multi();
  multi.zremrangebyscore(key, 0, windowStart);
  multi.zadd(key, now, now);
  multi.zrange(key, 0, -1);
  multi.expire(key, WINDOW_SIZE_IN_SECONDS);

  const results = await new Promise((resolve, reject) => {
    multi.exec((err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  const requestTimestamps = results[2];

  const requestsInWindow = requestTimestamps.length;
  const remaining = MAX_REQUESTS_PER_WINDOW - requestsInWindow;
  const oldestRequest = requestTimestamps[0] || now;
  const resetTime = Math.ceil((oldestRequest - windowStart) / 1000);

  return { remaining, resetTime };
}
```

##### API Key Validation Middleware

The `authMiddleware` uses Redis to cache API key validation results:

```js
const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header("api-key");
    logger.info(`Received API key: ${apiKey}`);

    if (!apiKey) {
      logger.warn("No API key provided");
      return res.status(401).json({ error: "API key is required" });
    }

    const isValid = apiKey === process.env.API_KEY;
    logger.info(`API key validation result: ${isValid}`);

    if (isValid) {
      await asyncRedis.setex(`api_key:${apiKey}`, 3600, "valid");
      logger.info("Valid API key cached");
      next();
    } else {
      await asyncRedis.setex(`api_key:${apiKey}`, 300, "invalid");
      logger.warn("Invalid API key cached");
      res.status(401).json({ error: "Invalid API key" });
    }
  } catch (error) {
    logger.error("Error in auth middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

#### 5. Redis Connection Management

The Redis client is created in `redisClient.js`. It's important to handle connection errors and implement reconnection strategies:

```js
client.on("error", (error) => {
  console.error("Redis connection error:", error);
});

client.on("ready", () => {
  console.log("Redis connection established");
});
```

Consider implementing a more robust reconnection strategy for production environments, such as:

```js
const MAX_RETRIES = 10;
let retryAttempts = 0;

client.on("error", (error) => {
  console.error("Redis connection error:", error);
  if (retryAttempts < MAX_RETRIES) {
    retryAttempts++;
    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${retryAttempts}/${MAX_RETRIES})...`
      );
      client.retry_strategy = () => 1000; // Retry after 1 second
    }, 1000 * retryAttempts);
  } else {
    console.error("Max retry attempts reached. Unable to connect to Redis.");
    process.exit(1);
  }
});

client.on("ready", () => {
  console.log("Redis connection established");
  retryAttempts = 0;
});
```

#### 6. Monitoring and Maintenance

- Use Redis CLI commands like `INFO` and `MONITOR` to check Redis server status and monitor real-time operations.
- Implement proper logging for Redis operations to track usage and diagnose issues.
- Regularly check Redis memory usage and consider implementing a memory limit to prevent out-of-memory errors.
- Implement a backup strategy for Redis data if persistence is required.

Example of monitoring Redis memory usage:

```js
const checkRedisMemory = async () => {
  const info = await asyncRedis.info("memory");
  const usedMemory = parseInt(info.match(/used_memory:(\d+)/)[1]);
  const maxMemory = 1024 * 1024 * 1024; // 1GB

  if (usedMemory > maxMemory * 0.8) {
    logger.warn(`Redis memory usage is high: ${usedMemory} bytes`);
  }
};

setInterval(checkRedisMemory, 60000); // Check every minute
```

#### 7. Environment Configuration

Ensure that the Redis connection details are correctly set in the `.env` file:

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=true
```

Adjust the `redisClient.js` file to use these additional configuration options when creating the Redis client:

```js
const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
});
```

By following these guidelines and examples, new engineers can effectively use Redis in this codebase for caching, rate limiting, and other purposes while maintaining best practices for performance and reliability.

———

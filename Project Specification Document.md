# Project Specification Document

## Project Overview

You are building a continuously augmented cybercrime API composed of millions of machine credentials compromised by info-stealers in global malware-spreading campaigns. It provides clients the ability to query a MongoDB database of over **29,919,523** computers compromised through global info-stealer campaigns performed by threat actors. The database is updated daily with new compromised computers, offering cybersecurity providers the ability to alert security teams ahead of imminent attacks when users get compromised and have their credentials stolen.

## Project Dependencies and Technologies

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

#### 14. `uuid`

- **Version**: ^10.0.0
- **Usage**: Generates RFC-compliant UUIDs.
- **Location**: Used in various parts of the application for generating unique identifiers.

#### 15. `winston`

- **Version**: ^3.9.0
- **Usage**: Logging library for Node.js.
- **Location**: Configured in `logger.js` for logging application events.

#### 16. `winston-daily-rotate-file`

- **Version**: ^5.0.0
- **Usage**: Transport for winston that logs to a rotating file each day.
- **Location**: Used in `logger.js` to manage log files.

### DevDependencies

#### 1. `jest`

- **Version**: ^29.5.0
- **Usage**: JavaScript testing framework.
- **Location**: Used in the `__tests__` directory for writing and running unit tests.

#### 2. `nodemon`

- **Version**: ^3.1.7
- **Usage**: Utility that monitors for changes in the source code and automatically restarts the server.
- **Location**: Used during development to automatically restart the server on code changes.

### Technologies

#### 1. **Node.js**

- **Usage**: JavaScript runtime environment used to build the backend of the application.
- **Location**: Core technology for the entire project.

#### 2. **MongoDB**

- **Usage**: NoSQL database used to store application data.
- **Location**: Configured in `database.js` and connected using Mongoose.

#### 3. **Redis**

- **Usage**: In-memory data structure store used for caching and other purposes.
- **Location**: Configured in `redisClient.js`

#### 4. **Express**

- **Usage**: Web framework for building the API.
- **Location**: Core framework used in `app.js`

#### 5. **Jest**

- **Usage**: Testing framework for writing and running tests.
- **Location**: Used in the `__tests__` directory.

#### 6. **Docker**

- **Usage**: Containerization platform to package the application and its dependencies.
- **Location**: Docker configuration files (if any) and Docker commands used in deployment scripts.

#### 7. **Git**

- **Usage**: Version control system for tracking changes in the source code.
- **Location**: `.gitignore` file and Git commands used for version control.

#### 8. **VS Code**

- **Usage**: Integrated Development Environment (IDE) for writing and editing code.
- **Location**: `.vscode` directory (if any) and VS Code-specific configuration files.

#### 9. **Node.js Performance Hooks**

- **Usage**: Built-in Node.js module for measuring the performance of operations.
- **Location**: Used in `loginBulkController.js` to measure the processing time of bulk search operations.

——

## Current File Structure

```
creds-api-backend/
├── Docs
│   ├── API Documentation.md
│   ├── API Endpoints Implementation.md
│   ├── Date Normatization Implementation.md
│   ├── Dependencies.md
│   ├── Logging Implementation.md
│   └── Redis Implementation.md
├── Project Requirement Document.md
├── Project Specification Document.md
├── __tests__
│   ├── dateService.test.js
│   └── loginController.test.js
├── app.js
├── config
│   ├── database.js
│   ├── logger.js
│   └── redisClient.js
├── controllers
│   ├── loginBulkController.js
│   └── loginController.js
├── database.js
├── logs
│   ├── application
│   │   ├── application-2024-10-21.log
│   │   ├── application-2024-10-21.log.gz
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
│   ├── requestIdMiddleware.js
│   ├── sendResponseMiddleware.js
│   └── sortingMiddleware.js
├── package-lock.json
├── package.json
├── routes
│   └── api
│       └── v1
│           ├── searchByLogin.js
│           └── searchByLoginBulk.js
├── sample.json
├── services
│   └── dateService.js
├── test.js
├── tests
│   └── loadTest.js
└── utils
    ├── dataProcessing.js
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
    },
    {
      "URL": "https://comapny.com/",
      "Username": "test@company.com",
      "Password": "testpass",
      "Application": "Opera GX_Unknown"
    },
    {
      "URL": "https://gmail.com/",
      "Username": "test@gmail.com",
      "Password": "testpass",
      "Application": "Opera GX_Unknown"
    }
  ],
  "Hash": "00004f5977440098482fcfe5712bb9a803babade75e009a947e252808c85b2b1",
  "Usernames": ["test@gmail.com", "test@company.com", "testname"],
  "Domains": ["test.com", "gmail.com", "company.com"],
  "Emails": ["test@company.com", "test@gmail.com"],
  "Employee": ["test@company.com"]
}
```

### MongoDB Collection Schema Documentation

#### Array Specifications

##### 1. Usernames Array

- **Source:** Derived from `Credentials.Username`
- **Content:** Includes only valid, normalized, and deduplicated usernames
- **Indexing:** Indexed to enhance search performance

##### 2. Emails Array

- **Source:** Derived from the `Usernames` Array
- **Content:** Contains only valid, normalized, and deduplicated email addresses
- **Indexing:** Indexed for faster search queries

##### 3. Employees Array

- **Source:** Derived from the `Emails` Array
- **Content:** Consists exclusively of valid, normalized, and deduplicated work email addresses
- **Indexing:** Indexed to optimize search efficiency

##### 4. Domains Array

- **Source:** Derived from `Credentials.URL`
- **Content:** Comprises only valid, normalized, and deduplicated domain names
- **Indexing:** Indexed to facilitate rapid search operations

#### Data Flow Summary

##### Derivation Chain

```
Credentials.Username → Usernames Array → Emails Array → Employees Array
Credentials.URL → Domains Array
```

##### Common Attributes

- All the above mentioned arrays contain validated, normalized, and deduplicated entries
- Data integrity and consistency are maintained throughout
- Each array is optimized for performance

##### Performance Considerations

- All the above mentioned arrays are indexed within the MongoDB schema
- Indexes are designed to provide efficient search capabilities
- Search operations are optimized for speed and reliability

## Implemented Features

1. **MongoDB Connection**: Implemented in `config/database.js`.
2. **Authentication**: API key-based authentication implemented in `middlewares/authMiddleware.js`.
3. **Rate Limiting**: Implemented in `middlewares/complexRateLimitMiddleware.js`.
4. **Search by Login (v1)**: Implemented in `controllers/v1/loginController.js`.
5. **Bulk Search by Login (v1)**: Implemented in `controllers/v1/loginBulkController.js`.
6. **Internal Search by Login**: Implemented in `controllers/internal/loginController.js`.
7. **Internal Bulk Search by Login**: Implemented in `controllers/internal/loginBulkController.js`.
8. **Date Normalization**: Implemented in `services/dateService.js` and `middlewares/dateNormalizationMiddleware.js`.
9. **Sorting**: Implemented in `middlewares/sortingMiddleware.js`.
10. **Pagination**: Implemented in `utils/paginationUtils.js`.
11. **Logging**: Implemented using Winston in `config/logger.js`.
12. **Redis Caching**: Implemented for API key validation and rate limiting in `config/redisClient.js`.
13. **Error Handling**: Consistent error handling implemented across controllers and middlewares.
14. **Request ID Tracking**: Implemented in `middlewares/requestIdMiddleware.js` for better traceability.
15. **Performance Monitoring**: Basic performance monitoring implemented in bulk search operations using Node.js Performance Hooks.
16. **API Versioning**: Implemented with separate routes for v1 and internal APIs.
17. **Modular Route Structure**: Implemented in `routes/api/v1/` and `routes/api/internal/` directories.
18. **Middleware Chain**: Consistent application of middleware chain (authentication, date normalization, sorting, response sending) across all routes.

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

#### 2. Search by Login (Bulk)

##### Endpoint

`POST /api/json/v1/search-by-login/bulk`

##### Description

Search for multiple user logins in a single request.

##### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: 1                                     |
| `installed_software` | Boolean | No       | Filter by installed software. Default: false                                   |

##### Request Body

| Parameter | Type     | Required | Description                                           |
| --------- | -------- | -------- | ----------------------------------------------------- |
| `logins`  | String[] | Yes      | Array of login usernames to search for (max 10 items) |

##### Example Request

POST /api/json/v1/search-by-login/bulk?sortby=date_uploaded&sortorder=asc&page=1

```json
{
  "logins": ["example1@email.com", "example2@email.com"]
}
```

##### Example Response

```json
{
  "total": 150,
  "page": 1,
  "results": [
    {
      "login": "example1@email.com",
      "total": 100,
      "data": [
        {
          "Usernames": "example1@email.com",
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z"
          // Other fields...
        }
        // More results...
      ]
    },
    {
      "login": "example2@email.com",
      "total": 50,
      "data": [
        {
          "Usernames": "example2@email.com",
          "Log date": "2023-07-24T10:15:45.000Z",
          "Date": "2023-07-24T10:15:45.000Z"
          // Other fields...
        }
        // More results...
      ]
    }
  ]
}
```

##### Errors

| Status Code | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| 400         | Bad Request - Invalid logins array or exceeds maximum limit |
| 401         | Unauthorized - Invalid or missing API key                   |
| 429         | Too Many Requests - Rate limit exceeded                     |
| 500         | Internal Server Error                                       |

#### 3. Test Date Normalization

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

#### 4. Internal Search by Login

##### Endpoint

`GET /api/json/internal/search-by-login`
`POST /api/json/internal/search-by-login`

##### Description

Internal endpoint for searching user login information. This endpoint mirrors the functionality of the v1 endpoint but is intended for internal use only.

##### Request Parameters

(Same as the v1 endpoint)

##### Example Request

GET /api/json/internal/search-by-login?login=example@email.com&sortby=date_uploaded&sortorder=asc&page=1

##### Example Response

(Same format as the v1 endpoint)

#### 5. Internal Search by Login (Bulk)

##### Endpoint

`POST /api/json/internal/search-by-login/bulk`

##### Description

Internal endpoint for bulk searching of user logins. This endpoint mirrors the functionality of the v1 bulk endpoint but is intended for internal use only.

##### Request Parameters

(Same as the v1 bulk endpoint)

##### Request Body

(Same as the v1 bulk endpoint)

##### Example Request

POST /api/json/internal/search-by-login/bulk?sortby=date_uploaded&sortorder=asc&page=1

##### Example Response

(Same format as the v1 bulk endpoint)

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

#### Note on Internal Endpoints

The `/api/json/internal` endpoints have been created to separate internal usage from consumer-facing endpoints. While they currently mirror the functionality of the `/api/json/v1` endpoints, they may be modified independently in the future to better suit internal needs without affecting the public API contract.

———

### API Endpoints and Routes Documentation

This document provides a detailed overview of the API endpoints, routes, middlewares, and controllers in the application. It also includes guidelines for implementing new API routes, controllers, and middlewares.

#### 1. API Versioning

Our API uses versioning to ensure backward compatibility as we evolve the API. The current version is v1, which is reflected in the URL structure: `/api/v1/`. We have also introduced internal endpoints under `/api/json/internal/` for internal use.

#### 2. API Endpoints and Routes Implementation

API endpoints and routes are defined in the `routes` directory. Each route file corresponds to a specific feature or resource.

##### 2.1 Search By Login Endpoint

Example: `routes/api/v1/searchByLogin.js`

```js
const express = require("express");
const router = express.Router();
const { searchByLogin } = require("../../../controllers/v1/loginController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.get(
  "/search-by-login",
  searchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
router.post(
  "/search-by-login",
  searchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

- **URL**: `/api/json/v1/search-by-login`
- **Methods**: GET, POST
- **Auth Required**: Yes
- **Query Parameters**:
  - `login` (required): The username to search for
  - `sortby` (optional): Field to sort by. Options: "date_compromised" (default), "date_uploaded"
  - `sortorder` (optional): Sort order. Options: "desc" (default), "asc"
  - `page` (optional): Page number for pagination. Default: 1
  - `installed_software` (optional): Boolean flag for installed software. Default: false

##### 2.2 Search By Login Bulk Endpoint

Example: `routes/api/v1/searchByLoginBulk.js`

```js
const express = require("express");
const router = express.Router();
const {
  searchByLoginBulk,
} = require("../../../controllers/v1/loginBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.post(
  "/search-by-login/bulk",
  searchByLoginBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

- **URL**: `/api/json/v1/search-by-login/bulk`
- **Method**: POST
- **Auth Required**: Yes
- **Query Parameters**:
  - `sortby` (optional): Field to sort by. Options: "date_compromised" (default), "date_uploaded"
  - `sortorder` (optional): Sort order. Options: "desc" (default), "asc"
  - `page` (optional): Page number for pagination. Default: 1
  - `installed_software` (optional): Boolean flag for installed software. Default: false
- **Request Body**:
  - `logins` (required): Array of email addresses to search for (max 10)

##### 2.3 Internal Search By Login Endpoint

Example: `routes/api/internal/searchByLogin.js`

```js
const express = require("express");
const router = express.Router();
const {
  internalSearchByLogin,
} = require("../../../controllers/internal/loginController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.get(
  "/search-by-login",
  internalSearchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
router.post(
  "/search-by-login",
  internalSearchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

- **URL**: `/api/json/internal/search-by-login`
- **Methods**: GET, POST
- **Auth Required**: Yes
- **Query Parameters**: Same as the v1 endpoint

##### 2.4 Internal Search By Login Bulk Endpoint

Example: `routes/api/internal/searchByLoginBulk.js`

```js
const express = require("express");
const router = express.Router();
const {
  internalSearchByLoginBulk,
} = require("../../../controllers/internal/loginBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.post(
  "/search-by-login/bulk",
  internalSearchByLoginBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

- **URL**: `/api/json/internal/search-by-login/bulk`
- **Method**: POST
- **Auth Required**: Yes
- **Query Parameters**: Same as the v1 bulk endpoint
- **Request Body**: Same as the v1 bulk endpoint

#### 3. Middlewares Implementation

Middlewares are implemented in the `middlewares` directory. They are used for tasks such as authentication, rate limiting, logging, date normalization, and sorting.

##### 3.1 Authentication Middleware

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

##### 3.2 Date Normalization Middleware

Example: `dateNormalizationMiddleware.js`

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

##### 3.3 Sorting Middleware

Example: `sortingMiddleware.js`

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

##### 3.4 Send Response Middleware

Example: `sendResponseMiddleware.js`

```js
const logger = require("../config/logger");

const sendResponseMiddleware = (req, res) => {
  logger.info("Sending response");
  res.json(req.searchResults);
};

module.exports = sendResponseMiddleware;
```

#### 4. Controllers Implementation

Controllers are now organized in separate directories for v1 and internal APIs. They are implemented in the `controllers/v1` and `controllers/internal` directories respectively. They handle the business logic for each route.

##### 4.1 V1 Login Controller

Example: `controllers/v1/loginController.js`

```js
const { getDatabase } = require("../config/database");
const logger = require("../config/logger");
const { getPaginationParams } = require("../utils/paginationUtils");

async function searchByLogin(req, res, next) {
  const login = req.body.login || req.query.login;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";

  logger.info(
    `Search initiated for login: ${login}, page: ${page}, installed_software: ${installedSoftware}`
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

    logger.info(
      `Search completed for login: ${login}, total results: ${total}`
    );

    req.searchResults = response;
    next();
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

##### 4.2 V1 Login Bulk Controller

Example: `controllers/v1/loginBulkController.js`

```js
const { getDatabase } = require("../config/database");
const logger = require("../config/logger");
const { getPaginationParams } = require("../utils/paginationUtils");
const { performance } = require("perf_hooks");

async function searchByLoginBulk(req, res, next) {
  const startTime = performance.now();
  const { logins } = req.body;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";

  logger.info(
    `Bulk search request received for ${logins.length} logins, page: ${page}, installed_software: ${installedSoftware}`
  );

  if (!Array.isArray(logins) || logins.length === 0 || logins.length > 10) {
    logger.warn("Invalid input: logins array", { loginCount: logins.length });
    return res.status(400).json({
      error: "Invalid logins array. Must contain 1-10 email addresses.",
    });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = logins.map(async (login) => {
      const query = { Usernames: login };
      const { limit, skip } = getPaginationParams(page);

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        login,
        total,
        data: results,
      };
    });

    const searchResults = await Promise.all(searchPromises);

    const totalResults = searchResults.reduce(
      (sum, result) => sum + result.total,
      0
    );
    const response = {
      total: totalResults,
      page,
      results: searchResults,
    };

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    logger.info(
      `Bulk search completed for ${
        logins.length
      } logins, total results: ${totalResults}, processing time: ${totalTime.toFixed(
        2
      )}ms`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByLoginBulk:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByLoginBulk,
};
```

##### 4.3 Internal Login Controller

Example: `controllers/internal/loginController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
async function internalSearchByLogin(req, res, next) {
  // Implementation similar to v1 searchByLogin, with internal-specific logging
  // ...
}
module.exports = {
  internalSearchByLogin,
};
```

##### 4.4 Internal Login Bulk Controller

Example: `controllers/internal/loginBulkController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
async function internalSearchByLoginBulk(req, res, next) {
  // Implementation similar to v1 searchByLoginBulk, with internal-specific logging
  // ...
}
module.exports = {
  internalSearchByLoginBulk,
};
```

#### 5. New Date Normalization and Sorting Flow

The flow for date normalization and sorting remains the same for both v1 and internal APIs:

1. Controller fetches raw data from the database.
2. Date Normalization Middleware normalizes the "Log date" fields.
3. Sorting Middleware sorts the normalized data based on query parameters.
4. Send Response Middleware sends the final response.

This flow allows for better separation of concerns and makes the code more modular and maintainable. It's applied consistently across both v1 and internal endpoints, ensuring uniform data processing.

#### 6. Guidelines for Implementing New API Routes

When implementing new API routes, follow these steps for both v1 and internal APIs:

1. Determine if the route is for v1 (consumer-facing) or internal use.
2. Create a new file in the appropriate directory: 3. For v1 routes: `routes/api/v1/` 4. For internal routes: `routes/api/internal/`
3. Define the route using Express.
4. Apply necessary middlewares (e.g., authentication, date normalization, sorting).
5. Call the appropriate controller function from the corresponding v1 or internal controller.
6. Use the sendResponseMiddleware as the last middleware in the chain.

Example for a new v1 route:

```js
const express = require("express");
const router = express.Router();
const { newController } = require("../../../controllers/v1/newController");
const authMiddleware = require("../../../middlewares/authMiddleware");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.get(
  "/new-route",
  authMiddleware,
  newController,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

Example for a new internal route:

```js
const express = require("express");
const router = express.Router();
const {
  newInternalController,
} = require("../../../controllers/internal/newController");
const authMiddleware = require("../../../middlewares/authMiddleware");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.get(
  "/new-internal-route",
  authMiddleware,
  newInternalController,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
module.exports = router;
```

Remember to update the `app.js` file to include the new route, using the appropriate path for v1 or internal APIs.

#### 7. Best Practices

- Use meaningful HTTP methods (GET, POST, PUT, DELETE) for different operations.
- Implement proper error handling and logging in all controllers and middlewares.
- Use environment variables for configuration and sensitive information.
- Follow RESTful naming conventions for endpoints.
- Implement input validation for all incoming data.
- Use the logger for consistent logging across the application.
- Store sensitive information like API keys in the `.env` file.
- Ensure proper error handling in controllers and middlewares.
- Use the middleware chain (dateNormalizationMiddleware, sortingMiddleware, sendResponseMiddleware) for consistent data processing and response handling.
- Clearly distinguish between v1 (consumer-facing) and internal routes and controllers.

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application.

#### 8. Current File Structure

The following file structure represents the organization of the codebase, highlighting the key components like structure of controllers, middlewares and routes related to API endpoint implementations:

```
project-root/
├── app.js
├── config/
│   ├── database.js
│   ├── logger.js
│   └── redisClient.js
├── controllers/
│   ├── loginController.js
│   └── loginBulkController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── complexRateLimitMiddleware.js
│   ├── dateNormalizationMiddleware.js
│   ├── rateLimitMiddleware.js
│   ├── requestIdMiddleware.js
│   ├── sendResponseMiddleware.js
│   └── sortingMiddleware.js
├── routes/
│   └── api/
│       └── v1/
│           ├── searchByLogin.js
│           └── searchByLoginBulk.js
├── services/
│   └── dateService.js
├── utils/
│   └── paginationUtils.js
├── Docs/
│   ├── API Documentation.md
│   ├── API Endpoints Implementation.md
│   └── Date Normatization Implementation.md
└── .env
```

#### 8. Reason for API Cloning

The API endpoints have been cloned and separated into `/api/json/v1` for consumer use and `/api/json/internal` for internal use. This separation allows for:

1. Independent evolution of internal APIs without affecting the public API contract.
2. Enhanced security by restricting access to internal endpoints.
3. Potential optimization of internal endpoints for specific use cases.
4. Easier management and maintenance of consumer-facing and internal APIs.

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application, while understanding the distinction between consumer-facing and internal APIs.

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
3. [`middlewares/sortingMiddleware.js`](middlewares/sortingMiddleware.js): Middleware for sorting normalized dates.
4. [`controllers/loginController.js`](controllers/loginController.js): Controller for single login search.
5. [`controllers/loginBulkController.js`](controllers/loginBulkController.js): Controller for bulk login search.
6. [`routes/api/v1/searchByLogin.js`](routes/api/v1/searchByLogin.js): Routes for single login search.
7. [`routes/api/v1/searchByLoginBulk.js`](routes/api/v1/searchByLoginBulk.js): Routes for bulk login search.
8. [`logs/new_date_formats.log`](logs/new_date_formats.log): Log file for unrecognized date formats.

#### New Flow for Date Normalization and Sorting

The new flow for date normalization and sorting follows these steps:

1. Controller fetches raw data from the database.
2. Date Normalization Middleware normalizes the "Log date" fields.
3. Sorting Middleware sorts the normalized data based on query parameters.
4. Send Response Middleware sends the final response.

##### 1. Controller (e.g., loginController.js)

The controller fetches data from the database without applying any sorting or normalization:

```javascript
async function searchByLogin(req, res, next) {
  // ... (input validation and setup)
  try {
    const db = await getDatabase();
    const collection = db.collection("logs");
    const query = { Usernames: login };
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
    req.searchResults = response;
    next();
  } catch (error) {
    // ... (error handling)
  }
}
```

##### 2. Date Normalization Middleware (dateNormalizationMiddleware.js)

This middleware normalizes the "Log date" fields in the response:

```javascript
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
```

##### 3. Sorting Middleware (sortingMiddleware.js)

This middleware sorts the normalized data based on query parameters:

```javascript
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
```

##### 4. Route Configuration

Configure the route to use these middlewares in the correct order:

```javascript
router.get(
  "/search-by-login",
  searchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
```

#### Date Normalization and Sorting: Input and Output Examples

This document provides examples of input and output for the date normalization and sorting processes in our application.

##### Date Normalization Example

###### Input (raw data from database):

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

Output (after date normalization):

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

###### Sorting Example

Input (normalized data):

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

Output (sorted by "Log date" in descending order):

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

These examples demonstrate how the `dateNormalizationMiddleware` normalizes the "Log date" field to a consistent format (ISO 8601), and how the `sortingMiddleware` can then sort the normalized dates based on the specified order.

Note that the "Date" field remains unchanged as it's already in a standardized format. The sorting can be applied to either the "Log date" or "Date" field, depending on the `sortby` parameter passed to the API.

###### Bulk Search Example

For bulk searches, the structure is slightly different:

###### \\# Input (raw data from database):

```json
{
  "total": 2,
  "page": 1,
  "results": [
    {
      "login": "user1@example.com",
      "total": 2,
      "data": [
        {
          "Log date": "17.05.2022 5:28:48",
          "Date": "2022-05-17",
          "other_field": "user1 value1"
        },
        {
          "Log date": "18.05.2022 10:15:30",
          "Date": "2022-05-18",
          "other_field": "user1 value2"
        }
      ]
    },
    {
      "login": "user2@example.com",
      "total": 1,
      "data": [
        {
          "Log date": "19.05.2022 14:45:00",
          "Date": "2022-05-19",
          "other_field": "user2 value1"
        }
      ]
    }
  ]
}
```

###### \\# Output (after normalization and sorting by "Log date" in descending order):

```json
{
  "total": 2,
  "page": 1,
  "results": [
    {
      "login": "user1@example.com",
      "total": 2,
      "data": [
        {
          "Log date": "2022-05-18T10:15:30.000Z",
          "Date": "2022-05-18",
          "other_field": "user1 value2"
        },
        {
          "Log date": "2022-05-17T05:28:48.000Z",
          "Date": "2022-05-17",
          "other_field": "user1 value1"
        }
      ]
    },
    {
      "login": "user2@example.com",
      "total": 1,
      "data": [
        {
          "Log date": "2022-05-19T14:45:00.000Z",
          "Date": "2022-05-19",
          "other_field": "user2 value1"
        }
      ]
    }
  ]
}
```

In the bulk search example, the date normalization is applied to each "Log date" field within the nested "data" arrays, and the sorting is applied to the "data" array of each result independently.

#### Implementing New API Routes with Date Normalization and Sorting

To implement a new API route that includes date normalization and sorting:

1. Create a new controller function that fetches data from the database without sorting.
2. Store the fetched data in `req.searchResults`.
3. Create a new route file in `routes/api/v1/`.
4. Configure the route to use the controller function, followed by `dateNormalizationMiddleware`, `sortingMiddleware`, and `sendResponseMiddleware`.

Example:

```javascript
// newController.js
async function newSearchFunction(req, res, next) {
  // ... fetch data from database
  req.searchResults = { results: fetchedData };
  next();
}

// routes/api/v1/newSearch.js
const express = require("express");
const router = express.Router();
const { newSearchFunction } = require("../../../controllers/newController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/new-search",
  newSearchFunction,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

#### Handling Unrecognized Date Formats

When an unrecognized date format is encountered:

1. The original date string is returned unchanged.
2. A warning is logged.
3. The unrecognized format is logged to [`logs/new_date_formats.log`](logs/new_date_formats.log) with a guessed format.

#### Adding New Date Formats

To add support for new date formats:

1. Open the `services/dateService.js` file.
2. Locate the `KNOWN_LOG_DATE_FORMATS` array.
3. Add the new format string to the array.
4. Update the `guessPossibleFormat` function to include the new format.
5. Test thoroughly with the new format added.

#### Best Practices

1. Always use the `parseDate` function from `services/dateService.js` when working with dates.
2. Regularly review and update the list of known date formats.
3. Monitor the `logs/new_date_formats.log` file for new, unsupported formats.
4. When adding new date formats, ensure thorough testing across the application.
5. Consider the performance impact of adding too many date formats.
6. Use logging in the date normalization and sorting middlewares to track their execution and help with debugging.
7. When implementing new features that involve dates, ensure they work correctly with the existing date normalization and sorting flow.
8. For bulk operations, make sure the date normalization and sorting are applied correctly to nested data structures.

By following these guidelines and using the updated middleware chain, you can ensure consistent date handling across the application, improving data quality and user experience.

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

###### Example: Logging in Controllers

In the `loginBulkController.js`, we use logging to track the progress of bulk search operations:

```javascript
logger.info(
  `Bulk search request received for ${logins.length} logins, page: ${page}, installed_software: ${installedSoftware}`
);

// ... (after processing)

logger.info(
  `Bulk search completed for ${
    logins.length
  } logins, total results: ${totalResults}, processing time: ${totalTime.toFixed(
    2
  )}ms`
);
```

###### Example: Logging in Middlewares

In middlewares like `dateNormalizationMiddleware.js` and `sortingMiddleware.js`, we use logging to track the execution of these middleware functions:

```javascript
// dateNormalizationMiddleware.js
logger.info("Date normalization middleware called");
// ... (after processing)
logger.info("Date normalization completed");

// sortingMiddleware.js
logger.info("Sorting middleware called");
logger.info(`Sorting parameters: sortBy=${sortField}, sortOrder=${sortOrder}`);
// ... (after processing)
logger.info("Sorting completed");
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

By following these guidelines and utilizing the provided logging infrastructure, you can ensure consistent and effective logging throughout the application, aiding in debugging, monitoring, and maintaining the system.

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
7. **Bulk Operations**: When implementing bulk operations like the new bulk search functionality, consider using Redis for caching frequently requested data or storing intermediate results to improve performance.

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

—

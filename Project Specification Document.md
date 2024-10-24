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

#### Table of Contents

1. [Authentication](#authentication "Authentication")
2. [Rate Limiting](#rate-limiting "Rate Limiting")
3. [Pagination](#pagination "Pagination")
4. [Date Normalization](#date-normalization "Date Normalization")
5. [Error Responses](#error-responses "Error Responses")
6. [Health Check](#health-check "Health Check")
7. [Endpoints](#endpoints "Endpoints") 8. [Search by Mail](#1-search-by-mail "1. Search by Mail") 9. [Search by Mail (Bulk)](#2-search-by-mail-bulk "2. Search by Mail (Bulk)") 10. [Search by Domain](#3-search-by-domain "3. Search by Domain") 11. [Search by Domain (Bulk)](#4-search-by-domain-bulk "4. Search by Domain (Bulk)") 12. [Test Date Normalization](#5-test-date-normalization "5. Test Date Normalization")
8. [Internal Endpoints](#internal-endpoints "Internal Endpoints") 14. [Internal Search by Mail](#6-internal-search-by-mail "6. Internal Search by Mail") 15. [Internal Search by Mail (Bulk)](#7-internal-search-by-mail-bulk "7. Internal Search by Mail (Bulk)") 16. [Internal Search by Domain](#8-internal-search-by-domain "8. Internal Search by Domain") 17. [Internal Search by Domain (Bulk)](#9-internal-search-by-domain-bulk "9. Internal Search by Domain (Bulk)")
9. [Document Redesign Process](#document-redesign-process "Document Redesign Process")
10. [Note on Internal Endpoints](#note-on-internal-endpoints "Note on Internal Endpoints")

---

#### Authentication

All endpoints (except `/health`) require an API key to be provided in the request headers.

##### Header

- `api-key: YOUR_API_KEY`

#### Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- **50 requests per 10-second window**

Rate limit information is provided in the response headers:

- `X-RateLimit-Limit: 50`
- `X-RateLimit-Remaining: 49`
- `X-RateLimit-Reset: 9`

#### Pagination

Results are paginated with a default page size of **50 items**. Use the `page` query parameter to navigate through pages.

#### Date Normalization

The API automatically normalizes dates in the `"Log date"` field to **ISO 8601** format (**UTC**) for consistency.

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

- `GET /health`

##### Description

Check the health status of the API.

##### Example Response

```json
{
  "status": "OK"
}
```

This endpoint does not require authentication and is not subject to rate limiting.

---

#### Endpoints

##### 1. Search by Mail

###### Endpoint

- `GET /api/json/v1/search-by-mail`
- `POST /api/json/v1/search-by-mail`

###### Description

Search for user mail information based on query parameters or request body.

###### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `mail`               | String  | Yes      | The mail address to search for.                                                |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

###### Example Request

`GET /api/json/v1/search-by-mail?mail=example@email.com&sortby=date_uploaded&sortorder=asc&page=1&type=all`

###### Example Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Usernames": "example@email.com",
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ],
      "ExternalCredentials": [
        {
          "URL": "https://othersite.com",
          "Username": "user@example.com",
          "Password": "password456"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "user@thirdsite.com",
          "Password": "password789"
        }
      ]
      // Other fields...
    }
    // More results...
  ]
}
```

###### Errors

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Mail parameter is required  |
| 401         | Unauthorized - Invalid or missing API key |
| 429         | Too Many Requests - Rate limit exceeded   |
| 500         | Internal Server Error                     |

##### 2. Search by Mail (Bulk)

###### Endpoint

- `POST /api/json/v1/search-by-mail/bulk`

###### Description

Search for multiple user mails in a single request.

###### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

###### Request Body

| Parameter | Type     | Required | Description                                          |
| --------- | -------- | -------- | ---------------------------------------------------- |
| `mails`   | String[] | Yes      | Array of mail addresses to search for (max 10 items) |

###### Example Request

`POST /api/json/v1/search-by-mail/bulk?sortby=date_uploaded&sortorder=asc&page=1&type=all`

```json
{
  "mails": ["example1@email.com", "example2@email.com"]
}
```

###### Example Response

```json
{
  "total": 150,
  "page": 1,
  "results": [
    {
      "mail": "example1@email.com",
      "total": 100,
      "data": [
        {
          "Usernames": "example1@email.com",
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example.com",
              "Username": "user@example.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    },
    {
      "mail": "example2@email.com",
      "total": 50,
      "data": [
        {
          "Usernames": "example2@email.com",
          "Log date": "2023-07-24T10:15:45.000Z",
          "Date": "2023-07-24T10:15:45.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example.com",
              "Username": "user@example.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    }
  ]
}
```

###### Errors

| Status Code | Description                                                |
| ----------- | ---------------------------------------------------------- |
| 400         | Bad Request - Invalid mails array or exceeds maximum limit |
| 401         | Unauthorized - Invalid or missing API key                  |
| 429         | Too Many Requests - Rate limit exceeded                    |
| 500         | Internal Server Error                                      |

##### 3. Search by Domain

###### Endpoint

- `GET /api/json/v1/search-by-domain`
- `POST /api/json/v1/search-by-domain`

###### Description

Search for domain information based on query parameters or request body.

###### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `domain`             | String  | Yes      | The domain to search for.                                                      |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

###### Example Request

`GET /api/json/v1/search-by-domain?domain=example.com&sortby=date_uploaded&sortorder=asc&page=1&type=all`

###### Example Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ],
      "ExternalCredentials": [
        {
          "URL": "https://othersite.com",
          "Username": "user@example.com",
          "Password": "password456"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "user@thirdsite.com",
          "Password": "password789"
        }
      ]
      // Other fields...
    }
    // More results...
  ]
}
```

###### Errors

| Status Code | Description                                |
| ----------- | ------------------------------------------ |
| 400         | Bad Request - Domain parameter is required |
| 401         | Unauthorized - Invalid or missing API key  |
| 429         | Too Many Requests - Rate limit exceeded    |
| 500         | Internal Server Error                      |

##### 4. Search by Domain (Bulk)

###### Endpoint

- `POST /api/json/v1/search-by-domain/bulk`

###### Description

Search for multiple domains in a single request.

###### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

###### Request Body

| Parameter | Type     | Required | Description                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| `domains` | String[] | Yes      | Array of domains to search for (max 10 items) |

###### Example Request

`POST /api/json/v1/search-by-domain/bulk?sortby=date_uploaded&sortorder=asc&page=1&type=all`

```json
{
  "domains": ["example1.com", "example2.com"]
}
```

###### Example Response

```json
{
  "total": 150,
  "page": 1,
  "results": [
    {
      "domain": "example1.com",
      "total": 100,
      "data": [
        {
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example1.com",
              "Username": "user@example1.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example1.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    },
    {
      "domain": "example2.com",
      "total": 50,
      "data": [
        {
          "Log date": "2023-07-24T10:15:45.000Z",
          "Date": "2023-07-24T10:15:45.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example2.com",
              "Username": "user@example2.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example2.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    }
  ]
}
```

###### Errors

| Status Code | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| 400         | Bad Request - Invalid domains array or exceeds maximum limit |
| 401         | Unauthorized - Invalid or missing API key                    |
| 429         | Too Many Requests - Rate limit exceeded                      |
| 500         | Internal Server Error                                        |

##### 5. Test Date Normalization

###### Endpoint

- `GET /api/json/v1/test-date-normalization`

###### Description

Test endpoint to verify date normalization functionality.

###### Example Response

```json
{
  "testLogDate1": "2022-05-17T05:28:48.000Z",
  "testLogDate2": "2022-05-17T05:28:48.375Z",
  "testLogDate3": "2022-05-17T05:28:48.000Z",
  "Date": "2023-10-21 14:30:00",
  "nonDateField": "This is not a date"
}
```

---

#### Internal Endpoints

##### 6. Internal Search by Mail

###### Endpoint

- `GET /api/json/internal/search-by-mail`
- `POST /api/json/internal/search-by-mail`

###### Description

Internal endpoint for searching user mail information. This endpoint mirrors the functionality of the v1 endpoint but is intended for internal use only.

###### Request Parameters

(Same as the `/api/json/v1/search-by-mail` endpoint)

###### Example Request

`GET /api/json/internal/search-by-mail?mail=example@email.com&sortby=date_uploaded&sortorder=asc&page=1`

###### Example Response

(Same format as the `/api/json/v1/search-by-mail` endpoint)

##### 7. Internal Search by Mail (Bulk)

###### Endpoint

- `POST /api/json/internal/search-by-mail/bulk`

###### Description

Internal endpoint for bulk searching of user mails. This endpoint mirrors the functionality of the v1 bulk endpoint but is intended for internal use only.

###### Request Parameters

(Same as the `/api/json/v1/search-by-mail/bulk` endpoint)

###### Request Body

(Same as the `/api/json/v1/search-by-mail/bulk` endpoint)

###### Example Request

`POST /api/json/internal/search-by-mail/bulk?sortby=date_uploaded&sortorder=asc&page=1`

###### Example Response

(Same format as the `/api/json/v1/search-by-mail/bulk` endpoint)

##### 8. Internal Search by Domain

###### Endpoint

- `GET /api/json/internal/search-by-domain`
- `POST /api/json/internal/search-by-domain`

###### Description

Internal endpoint for searching domain information. Intended for internal use only.

###### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `domain`             | String  | Yes      | The domain to search for.                                                      |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |

###### Example Request

`GET /api/json/internal/search-by-domain?domain=example.com&sortby=date_uploaded&sortorder=asc&page=1`

###### Example Response

(Similar format as the `/api/json/v1/search-by-domain` endpoint)

##### 9. Internal Search by Domain (Bulk)

###### Endpoint

- `POST /api/json/internal/search-by-domain/bulk`

###### Description

Internal endpoint for bulk searching of domains. Intended for internal use only.

###### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |

###### Request Body

| Parameter | Type     | Required | Description                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| `domains` | String[] | Yes      | Array of domains to search for (max 10 items) |

###### Example Request

`POST /api/json/internal/search-by-domain/bulk?sortby=date_uploaded&sortorder=asc&page=1`

```json
{
  "domains": ["example1.com", "example2.com"]
}
```

###### Example Response

(Similar format as the `/api/json/v1/search-by-domain/bulk` endpoint)

---

#### Document Redesign Process

Both single and bulk search responses go through a document redesign process:

1. **Removed Fields**:

   - `Folder Name`
   - `Build ID`
   - `Hash`
   - `Usernames`
   - `Domains`
   - `Emails`
   - `Employee`

2. **Credential Categorization**:

   - `InternalCredentials`: Credentials where the searched email's domain matches the domain in `Credentials.URL`.
   - `ExternalCredentials`: Credentials where the searched email's domain matches the domain in `Credentials.Username`.
   - `OtherCredentials`: All remaining credentials.

3. **Field Retention**:

   - All other fields from the original document are retained.

##### Example Redesigned Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ],
      "ExternalCredentials": [
        {
          "URL": "https://othersite.com",
          "Username": "user@example.com",
          "Password": "password456"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "user@thirdsite.com",
          "Password": "password789"
        }
      ]
      // Other fields...
    }
    // More results...
  ]
}
```

These changes implement the new document redesign feature for the `/search-by-mail` and `/search-by-mail/bulk` routes. The new middleware processes the documents after sorting and before sending the response.

---

#### Note on Internal Endpoints

The `/api/json/internal` endpoints have been created to separate internal usage from consumer-facing endpoints. While they currently mirror the functionality of the `/api/json/v1` endpoints, they may be modified independently in the future to better suit internal needs without affecting the public API contract.

Please ensure that you have the appropriate permissions and authentication to access these internal endpoints.

---

Remember to test these endpoints thoroughly, especially with various edge cases in the `Credentials` array, to ensure everything works as expected.

———

### API Endpoints and Routes Documentation

This document provides a detailed overview of the API endpoints, routes, middlewares, and controllers in the application. It also includes guidelines for implementing new API routes, controllers, and middlewares.

#### 1. API Versioning

Our API uses versioning to ensure backward compatibility as we evolve the API. The current version is **v1**, which is reflected in the URL structure: `/api/json/v1/`. We have also introduced internal endpoints under `/api/json/internal/` for internal use.

---

#### 2. API Endpoints and Routes Implementation

API endpoints and routes are defined in the `routes` directory. Each route file corresponds to a specific feature or resource.

##### 2.1 Search By Mail Endpoint

**File:** `routes/api/v1/searchByMail.js`

```js
const express = require("express");
const router = express.Router();
const { searchByMail } = require("../../../controllers/v1/mailController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-mail",
  searchByMail,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-mail",
  searchByMail,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

- **URL**: `/api/json/v1/search-by-mail`
- **Methods**: `GET`, `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `mail` (required): The email address to search for
  - `sortby` (optional): Field to sort by. Options: `date_compromised` (default), `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc` (default), `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`
  - `type` (optional): Search type. Options: `"strict"` (default), `"all"`
  - `"strict"`: Searches in the `"Employee"` field
  - `"all"`: Searches in the `"Emails"` field

##### 2.2 Search By Mail Bulk Endpoint

**File:** `routes/api/v1/searchByMailBulk.js`

```js
const express = require("express");
const router = express.Router();
const {
  searchByMailBulk,
} = require("../../../controllers/v1/mailBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-mail/bulk",
  searchByMailBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

- **URL**: `/api/json/v1/search-by-mail/bulk`
- **Method**: `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `sortby` (optional): Field to sort by. Options: `date_compromised` (default), `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc` (default), `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`
  - `type` (optional): Search type. Options: `"strict"` (default), `"all"`
- **Request Body**:
  - `mails` (required): Array of email addresses to search for (max 10 items)

##### 2.3 Search By Domain Endpoint

**File:** `routes/api/v1/searchByDomain.js`

```js
const express = require("express");
const router = express.Router();
const { searchByDomain } = require("../../../controllers/v1/domainController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignDomainMiddleware = require("../../../middlewares/documentRedesignDomainMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-domain",
  searchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignDomainMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-domain",
  searchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignDomainMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

- **URL**: `/api/json/v1/search-by-domain`
- **Methods**: `GET`, `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `domain` (required): The domain to search for
  - `sortby` (optional): Field to sort by. Options: `date_compromised` (default), `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc` (default), `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`
  - `type` (optional): Search type. Options: `"strict"` (default), `"all"`
  - `"strict"`: Searches in the `"Employee"` field
  - `"all"`: Searches in the `"Emails"` field

##### 2.4 Search By Domain Bulk Endpoint

**File:** `routes/api/v1/searchByDomainBulk.js`

```js
const express = require("express");
const router = express.Router();
const {
  searchByDomainBulk,
} = require("../../../controllers/v1/domainBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignDomainMiddleware = require("../../../middlewares/documentRedesignDomainMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-domain/bulk",
  searchByDomainBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignDomainMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

- **URL**: `/api/json/v1/search-by-domain/bulk`
- **Method**: `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `sortby` (optional): Field to sort by. Options: `date_compromised` (default), `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc` (default), `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`
  - `type` (optional): Search type. Options: `"strict"` (default), `"all"`
- **Request Body**:
  - `domains` (required): Array of domains to search for (max 10 items)

##### 2.5 Internal Search By Login Endpoint

**File:** `routes/api/internal/searchByLogin.js`

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
- **Methods**: `GET`, `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `login` (required): The login (username) to search for
  - `sortby` (optional): Field to sort by. Options: `date_compromised`, `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc`, `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`

##### 2.6 Internal Search By Login Bulk Endpoint

**File:** `routes/api/internal/searchByLoginBulk.js`

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
- **Method**: `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `sortby` (optional): Field to sort by. Options: `date_compromised`, `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc`, `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`
- **Request Body**:
  - `logins` (required): Array of logins (usernames) to search for (max 10 items)

##### 2.7 Internal Search By Domain Endpoint

**File:** `routes/api/internal/searchByDomain.js`

```js
const express = require("express");
const router = express.Router();
const {
  searchByDomain,
} = require("../../../controllers/internal/domainController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-domain",
  searchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-domain",
  searchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

- **URL**: `/api/json/internal/search-by-domain`
- **Methods**: `GET`, `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `domain` (required): The domain to search for
  - `sortby` (optional): Field to sort by. Options: `date_compromised`, `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc`, `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`

##### 2.8 Internal Search By Domain Bulk Endpoint

**File:** `routes/api/internal/searchByDomainBulk.js`

```js
const express = require("express");
const router = express.Router();
const {
  searchByDomainBulk,
} = require("../../../controllers/internal/domainBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-domain/bulk",
  searchByDomainBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

- **URL**: `/api/json/internal/search-by-domain/bulk`
- **Method**: `POST`
- **Auth Required**: Yes
- **Query Parameters**:
  - `sortby` (optional): Field to sort by. Options: `date_compromised`, `date_uploaded`
  - `sortorder` (optional): Sort order. Options: `desc`, `asc`
  - `page` (optional): Page number for pagination. Default: `1`
  - `installed_software` (optional): Boolean flag for installed software. Default: `false`
- **Request Body**:
  - `domains` (required): Array of domains to search for (max 10 items)

#### 3. Middlewares Implementation

Middlewares are implemented in the `middlewares` directory. They are used for tasks such as authentication, rate limiting, logging, date normalization, sorting, and document redesign.

##### 3.1 Authentication Middleware

**File:** `middlewares/authMiddleware.js`

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

**File:** `middlewares/dateNormalizationMiddleware.js`

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

**File:** `middlewares/sortingMiddleware.js`

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

##### 3.4 Document Redesign Middleware

**File:** `middlewares/documentRedesignMiddleware.js`

```js
const { sanitizeDomain } = require("../utils/domainUtils");
const logger = require("../config/logger");

const documentRedesignMiddleware = async (req, res, next) => {
  if (!req.searchResults) {
    return next();
  }

  logger.info("Document redesign middleware called");
  logger.debug(
    "req.searchResults structure:",
    JSON.stringify(req.searchResults, null, 2)
  );

  const redesignDocument = async (doc, searchedEmail) => {
    logger.debug("Redesigning document:", JSON.stringify(doc, null, 2));

    if (!doc || typeof doc !== "object") {
      logger.warn("Invalid document structure:", doc);
      return doc;
    }

    const {
      "Folder Name": folderName,
      "Build ID": buildId,
      Hash: hash,
      Usernames: usernames,
      Domains: domains,
      Emails: emails,
      Employee: employee,
      Credentials,
      ...remainingFields
    } = doc;

    let searchedDomain = null;
    if (
      searchedEmail &&
      typeof searchedEmail === "string" &&
      searchedEmail.includes("@")
    ) {
      searchedDomain = await sanitizeDomain(searchedEmail.split("@")[1]);
    } else {
      logger.warn("searchedEmail is invalid or undefined:", searchedEmail);
      searchedDomain = null;
    }

    logger.debug("Searched domain:", searchedDomain);

    const categorizedCredentials = {
      InternalCredentials: [],
      ExternalCredentials: [],
      OtherCredentials: [],
    };

    if (Array.isArray(Credentials)) {
      logger.debug("Processing Credentials array");
      for (const cred of Credentials) {
        try {
          const credUrlDomain = cred.URL
            ? await sanitizeDomain(new URL(cred.URL).hostname)
            : null;
          const credUsernameDomain =
            cred.Username && cred.Username.includes("@")
              ? await sanitizeDomain(cred.Username.split("@")[1])
              : null;

          logger.debug("Credential domains:", {
            credUrlDomain,
            credUsernameDomain,
            searchedDomain,
          });

          if (credUrlDomain === searchedDomain) {
            categorizedCredentials.InternalCredentials.push(cred);
          } else if (credUsernameDomain === searchedDomain) {
            categorizedCredentials.ExternalCredentials.push(cred);
          } else {
            categorizedCredentials.OtherCredentials.push(cred);
          }
        } catch (error) {
          logger.warn(`Error processing credential: ${error.message}`, {
            credential: cred,
          });
          categorizedCredentials.OtherCredentials.push(cred);
        }
      }
    } else {
      logger.warn(`Credentials is not an array for document:`, {
        docId: doc._id,
        credentials: Credentials,
      });
    }

    logger.debug("Categorized credentials:", categorizedCredentials);

    return {
      ...remainingFields,
      ...categorizedCredentials,
    };
  };

  try {
    if (
      req.searchResults &&
      req.searchResults.results &&
      Array.isArray(req.searchResults.results)
    ) {
      if (
        req.searchResults.results.length > 0 &&
        req.searchResults.results[0] &&
        "data" in req.searchResults.results[0]
      ) {
        // Bulk search
        logger.info("Processing bulk search results");
        req.searchResults.results = await Promise.all(
          req.searchResults.results.map(async (result) => {
            logger.debug("Processing result for mail:", result.mail);
            const searchedEmail = result.mail;
            if (result.data && Array.isArray(result.data)) {
              result.data = await Promise.all(
                result.data.map((doc) => redesignDocument(doc, searchedEmail))
              );
            }
            return result;
          })
        );
      } else {
        // Single search
        logger.info("Processing single search results");
        const searchedEmail = req.query.mail || req.body.mail;
        req.searchResults.results = await Promise.all(
          req.searchResults.results.map((doc) =>
            redesignDocument(doc, searchedEmail)
          )
        );
      }
    } else {
      logger.warn("Unexpected searchResults structure:", req.searchResults);
    }

    logger.info("Document redesign completed");
    next();
  } catch (error) {
    logger.error("Error in document redesign middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = documentRedesignMiddleware;
```

##### 3.5 Send Response Middleware

**File:** `middlewares/sendResponseMiddleware.js`

```js
const logger = require("../config/logger");

const sendResponseMiddleware = (req, res) => {
  logger.info("Sending response");
  res.json(req.searchResults);
};

module.exports = sendResponseMiddleware;
```

---

#### 4. Controllers Implementation

Controllers are organized in separate directories for `v1` and `internal` APIs. They handle the business logic for each route.

##### 4.1 V1 Mail Controller

**File:** `controllers/v1/mailController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");

async function searchByMail(req, res, next) {
  const mail = req.body.mail || req.query.mail;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";

  logger.info(
    `Search initiated for mail: ${mail}, page: ${page}, installed_software: ${installedSoftware}, type: ${type}`
  );

  if (!mail) {
    return res.status(400).json({ error: "Mail parameter is required" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query = type === "all" ? { Emails: mail } : { Employee: mail };
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

    logger.info(`Search completed for mail: ${mail}, total results: ${total}`);

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMail:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByMail,
};
```

##### 4.2 V1 Mail Bulk Controller

**File:** `controllers/v1/mailBulkController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { performance } = require("perf_hooks");

async function searchByMailBulk(req, res, next) {
  const startTime = performance.now();
  const { mails } = req.body;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";

  logger.info(
    `Bulk search request received for ${mails.length} mails, page: ${page}, installed_software: ${installedSoftware}, type: ${type}`
  );

  if (!Array.isArray(mails) || mails.length === 0 || mails.length > 10) {
    logger.warn("Invalid input: mails array", { mailCount: mails.length });
    return res.status(400).json({
      error: "Invalid mails array. Must contain 1-10 email addresses.",
    });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = mails.map(async (mail) => {
      const query = type === "all" ? { Emails: mail } : { Employee: mail };
      const { limit, skip } = getPaginationParams(page);

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        mail,
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
        mails.length
      } mails, total results: ${totalResults}, processing time: ${totalTime.toFixed(
        2
      )}ms`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMailBulk:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByMailBulk,
};
```

##### 4.3 V1 Domain Controller

**File:** `controllers/v1/domainController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");

async function searchByDomain(req, res, next) {
  const domain = req.body.domain || req.query.domain;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";

  logger.info(
    `Search initiated for domain: ${domain}, page: ${page}, installed_software: ${installedSoftware}, type: ${type}`
  );

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  const sanitizedDomain = await sanitizeDomain(domain);
  if (!sanitizedDomain) {
    return res.status(400).json({ error: "Invalid domain provided" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query =
      type === "all"
        ? { Emails: { $regex: `@${sanitizedDomain}$`, $options: "i" } }
        : { Employee: { $regex: `@${sanitizedDomain}$`, $options: "i" } };
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
      `Search completed for domain: ${domain}, total results: ${total}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByDomain:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByDomain,
};
```

##### 4.4 V1 Domain Bulk Controller

**File:** `controllers/v1/domainBulkController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");
const { performance } = require("perf_hooks");

async function searchByDomainBulk(req, res, next) {
  const startTime = performance.now();
  const { domains } = req.body;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";

  logger.info(
    `Bulk search request received for ${domains.length} domains, page: ${page}, installed_software: ${installedSoftware}, type: ${type}`
  );

  if (!Array.isArray(domains) || domains.length === 0 || domains.length > 10) {
    logger.warn("Invalid input: domains array", {
      domainCount: domains.length,
    });
    return res.status(400).json({
      error: "Invalid domains array. Must contain 1-10 domains.",
    });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = domains.map(async (domain) => {
      const sanitizedDomain = await sanitizeDomain(domain);
      if (!sanitizedDomain) {
        return {
          domain,
          error: "Invalid domain",
          total: 0,
          data: [],
        };
      }

      const query =
        type === "all"
          ? { Emails: { $regex: `@${sanitizedDomain}$`, $options: "i" } }
          : { Employee: { $regex: `@${sanitizedDomain}$`, $options: "i" } };
      const { limit, skip } = getPaginationParams(page);

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        domain: sanitizedDomain,
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
        domains.length
      } domains, total results: ${totalResults}, processing time: ${totalTime.toFixed(
        2
      )}ms`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByDomainBulk:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByDomainBulk,
};
```

#### 5. New Date Normalization, Sorting, and Document Redesign Flow

The flow for date normalization, sorting, and document redesign remains the same for both v1 and internal APIs:

1. **Controller** fetches raw data from the database.
2. **Date Normalization Middleware** normalizes the `"Log date"` and `"Date"` fields.
3. **Sorting Middleware** sorts the normalized data based on query parameters.
4. **Document Redesign Middleware** processes the documents to redesign the structure.
5. **Send Response Middleware** sends the final response.

This flow allows for better separation of concerns and makes the code more modular and maintainable. It's applied consistently across both v1 and internal endpoints, ensuring uniform data processing.

#### 6. Guidelines for Implementing New API Routes

When implementing new API routes, follow these steps for both v1 and internal APIs:

1. **Determine** if the route is for v1 (consumer-facing) or internal use.
2. **Create** a new file in the appropriate directory: 3. For v1 routes: `routes/api/v1/` 4. For internal routes: `routes/api/internal/`
3. **Define** the route using Express.
4. **Apply** necessary middlewares (e.g., authentication, date normalization, sorting, document redesign).
5. **Call** the appropriate controller function from the corresponding v1 or internal controller.
6. **Use** the `sendResponseMiddleware` as the last middleware in the chain.

**Example for a new v1 route:**

```js
const express = require("express");
const router = express.Router();
const { newController } = require("../../../controllers/v1/newController");
const authMiddleware = require("../../../middlewares/authMiddleware");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/new-route",
  authMiddleware,
  newController,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;
```

**Example for a new internal route:**

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

- **Use meaningful HTTP methods** (`GET`, `POST`, `PUT`, `DELETE`) for different operations.
- **Implement proper error handling and logging** in all controllers and middlewares.
- **Use environment variables** for configuration and sensitive information.
- **Follow RESTful naming conventions** for endpoints.
- **Implement input validation** for all incoming data.
- **Use the logger** for consistent logging across the application.
- **Store sensitive information** like API keys in the `.env` file.
- **Ensure proper error handling** in controllers and middlewares.
- **Use the middleware chain** (`dateNormalizationMiddleware`, `sortingMiddleware`, `documentRedesignMiddleware`, `sendResponseMiddleware`) for consistent data processing and response handling.
- **Clearly distinguish** between v1 (consumer-facing) and internal routes and controllers.

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application.

#### 8. Current File Structure

The following file structure represents the organization of the codebase, highlighting the key components like the structure of controllers, middlewares, and routes related to API endpoint implementations:

```
creds-api-backend
├── app.js
├── config/
│   ├── database.js
│   ├── logger.js
│   └── redisClient.js
├── controllers/
│   ├── v1/
│   │   ├── mailController.js
│   │   ├── mailBulkController.js
│   │   ├── domainController.js
│   │   └── domainBulkController.js
│   ├── internal/
│       ├── loginController.js
│       ├── loginBulkController.js
│       ├── domainController.js
│       └── domainBulkController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── dateNormalizationMiddleware.js
│   ├── sortingMiddleware.js
│   ├── documentRedesignMiddleware.js
│   ├── documentRedesignDomainMiddleware.js
│   ├── sendResponseMiddleware.js
│   ├── complexRateLimitMiddleware.js
│   ├── requestIdMiddleware.js
│   └── rateLimitMiddleware.js
├── routes/
│   └── api/
│       ├── v1/
│           ├── searchByMail.js
│           ├── searchByMailBulk.js
│           ├── searchByDomain.js
│           └── searchByDomainBulk.js
│       └── internal/
│           ├── searchByLogin.js
│           ├── searchByLoginBulk.js
│           ├── searchByDomain.js
│           └── searchByDomainBulk.js
├── services/
│   └── dateService.js
├── utils/
│   ├── paginationUtils.js
│   └── domainUtils.js
└── .env
```

———

### Date Handling, Normalization, and Sorting: A Comprehensive Guide for API Implementation

This document provides a detailed overview of how dates are handled, normalized, and sorted in our API.

#### Overview

Our API implements a consistent approach to date handling across all routes, ensuring that dates are properly normalized and sorted according to user requests. This process is applied uniformly to both single and bulk search operations.

#### Purpose

Date normalization is essential in our application to ensure consistent date representations across various data sources and user inputs. This consistency is crucial for:

1. Accurate sorting and filtering of data based on dates.
2. Consistent display of date information across the application.
3. Improved data quality and reduced errors in date-based operations.
4. Facilitating log analysis and user activity tracking.

#### Components Involved

1. Controllers
2. Date Normalization Middleware
3. Sorting Middleware
4. Date Service
5. Domain Utils (for domain-specific operations)

#### Relevant Files

1. `services/dateService.js`: Core date parsing and normalization logic.
2. `middlewares/dateNormalizationMiddleware.js`: Middleware for normalizing dates in responses.
3. `middlewares/sortingMiddleware.js`: Middleware for sorting normalized dates.
4. `controllers/loginController.js`: Controller for single login search.
5. `controllers/loginBulkController.js`: Controller for bulk login search.
6. `routes/api/v1/searchByLogin.js`: Routes for single login search.
7. `routes/api/v1/searchByLoginBulk.js`: Routes for bulk login search.
8. `logs/new_date_formats.log`: Log file for unrecognized date formats.

#### Data Flow

##### Single Search Routes (e.g., search-by-login, search-by-domain)

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

4. Send Response Middleware 2. Sends the final sorted and normalized data

##### Bulk Search Routes (e.g., search-by-login/bulk, search-by-domain/bulk)

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

4. Send Response Middleware 2. Sends the final sorted and normalized data

#### Detailed Component Analysis

##### Controllers

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

##### Date Normalization Middleware

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

##### Sorting Middleware

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

##### Date Service

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

#### Sorting Behavior: "date_compromised" vs "date_uploaded"

Our API supports two sorting options: "date_compromised" and "date_uploaded". Here's how they differ:

1. "date_compromised" (default):

   - Uses the "Log date" field
   - This field goes through the date normalization process
   - Represents when the credentials were compromised
   - May have various initial formats, which are normalized

2. "date_uploaded": 2. Uses the "Date" field 3. This field does not go through the normalization process 4. Represents when the data was uploaded to the database 5. Assumed to be in a consistent "YYYY-MM-DD HH:mm:ss" format

The sorting logic in the middleware is the same for both options, but they operate on different fields.

#### Domain-Specific Handling

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

#### Handling Unrecognized Date Formats

When an unrecognized date format is encountered:

1. The original date string is returned unchanged.
2. A warning is logged.
3. The unrecognized format is logged to `logs/new_date_formats.log` with a guessed format.

#### Adding New Date Formats

To add support for new date formats:

1. Open the `services/dateService.js` file.
2. Locate the `KNOWN_LOG_DATE_FORMATS` array.
3. Add the new format string to the array.
4. Update the `guessPossibleFormat` function to include the new format.
5. Test thoroughly with the new format added.

#### Date Normalization and Sorting: Input and Output Examples

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

###### Output (after date normalization):

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

##### Sorting Example

###### Input (normalized data):

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

###### Output (sorted by "Log date" in descending order):

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

#### Implementing Date Normalization and Sorting in a New Endpoint

Here's a complete example of how to implement date normalization and sorting in a new endpoint:

##### 1. Route Definition (routes/api/v1/newEndpoint.js)

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

##### 2. Controller Function (controllers/v1/newEndpointController.js)

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

##### 3. Middleware Chain

The middleware chain in the route definition ensures that:

1. The controller function fetches the data and stores it in `req.searchResults`.
2. The `dateNormalizationMiddleware` normalizes any "Log date" fields in the results.
3. The `sortingMiddleware` sorts the normalized data based on query parameters.
4. The `sendResponseMiddleware` sends the final, processed response.

By following this pattern, you can easily implement date normalization and sorting in any new endpoint you create.

#### Efficiency and Performance Considerations

1. Caching: Domain sanitization results are cached using LRU cache to improve performance for repeated queries.
2. Asynchronous Operations: Date parsing and domain sanitization are performed asynchronously to prevent blocking the event loop.
3. Single Pass: Date normalization and sorting occur exactly once per request, avoiding redundant operations.

#### Conclusion

The current implementation ensures consistent and efficient date handling across all API routes. Date normalization occurs only for the "Log date" field, while sorting can be performed on either "Log date" or "Date" fields. This approach provides flexibility for different use cases while maintaining data integrity.

#### Recommendations

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

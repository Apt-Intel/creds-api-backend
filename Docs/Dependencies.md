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

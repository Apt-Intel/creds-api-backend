## API Endpoints and Routes Documentation

This document provides a detailed overview of the API endpoints, routes, middlewares, and controllers in the application. It also includes guidelines for implementing new API routes, controllers, and middlewares.

### 1. API Versioning

Our API uses versioning to ensure backward compatibility as we evolve the API. The current version is v1, which is reflected in the URL structure: `/api/v1/`.

### 2. API Endpoints and Routes Implementation

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

#### 2.1 Search By Login Endpoint

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

### 3. Middlewares Implementation

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

#### 3.1 Authentication

The `authMiddleware` checks for a valid API key in the request headers. To use the API, clients must include their API key in the `api-key` header of each request.

**Example:**

```
Headers:
api-key: your_api_key_here
```

If the API key is missing or invalid, the middleware will return a 401 Unauthorized response.

### 4. Controllers Implementation

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

### 5. Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. Common error codes include:

- 400 Bad Request: Invalid input parameters
- 401 Unauthorized: Missing or invalid API key
- 500 Internal Server Error: Unexpected server error

Error responses include a JSON body with an `error` field describing the error.

### 6. Pagination

The API supports pagination for endpoints that return multiple results. Use the `page` query parameter to specify the desired page. The response includes `total` (total number of results) and `page` (current page number) fields.

### 7. Data Normalization

The API normalizes date fields ("Log date" and "Date") to ensure consistent formatting. Dates are returned in ISO 8601 format (e.g., "2023-07-23T09:38:30.000Z").

### 8. Guidelines for Implementing New API Routes

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

### 9. Code Structure

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

### 10. Best Practices

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

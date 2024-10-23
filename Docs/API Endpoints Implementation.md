## API Endpoints and Routes Documentation

This document provides a detailed overview of the API endpoints, routes, middlewares, and controllers in the application. It also includes guidelines for implementing new API routes, controllers, and middlewares.

### 1. API Versioning

Our API uses versioning to ensure backward compatibility as we evolve the API. The current version is v1, which is reflected in the URL structure: `/api/v1/`. We have also introduced internal endpoints under `/api/json/internal/` for internal use.

### 2. API Endpoints and Routes Implementation

API endpoints and routes are defined in the `routes` directory. Each route file corresponds to a specific feature or resource.

#### 2.1 Search By Login Endpoint

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

#### 2.2 Search By Login Bulk Endpoint

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

#### 2.3 Internal Search By Login Endpoint

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

#### 2.4 Internal Search By Login Bulk Endpoint

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

### 3. Middlewares Implementation

Middlewares are implemented in the `middlewares` directory. They are used for tasks such as authentication, rate limiting, logging, date normalization, and sorting.

#### 3.1 Authentication Middleware

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

#### 3.2 Date Normalization Middleware

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

#### 3.3 Sorting Middleware

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

#### 3.4 Send Response Middleware

Example: `sendResponseMiddleware.js`

```js
const logger = require("../config/logger");

const sendResponseMiddleware = (req, res) => {
  logger.info("Sending response");
  res.json(req.searchResults);
};

module.exports = sendResponseMiddleware;
```

### 4. Controllers Implementation

Controllers are now organized in separate directories for v1 and internal APIs. They are implemented in the `controllers/v1` and `controllers/internal` directories respectively. They handle the business logic for each route.

#### 4.1 V1 Login Controller

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

#### 4.2 V1 Login Bulk Controller

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

#### 4.3 Internal Login Controller

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

#### 4.4 Internal Login Bulk Controller

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

### 5. New Date Normalization and Sorting Flow

The flow for date normalization and sorting remains the same for both v1 and internal APIs:

1. Controller fetches raw data from the database.
2. Date Normalization Middleware normalizes the "Log date" fields.
3. Sorting Middleware sorts the normalized data based on query parameters.
4. Send Response Middleware sends the final response.

This flow allows for better separation of concerns and makes the code more modular and maintainable. It's applied consistently across both v1 and internal endpoints, ensuring uniform data processing.

### 6. Guidelines for Implementing New API Routes

When implementing new API routes, follow these steps for both v1 and internal APIs:

1. Determine if the route is for v1 (consumer-facing) or internal use.
2. Create a new file in the appropriate directory:
   - For v1 routes: `routes/api/v1/`
   - For internal routes: `routes/api/internal/`
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

### 7. Best Practices

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

### 8. Current File Structure

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

### 8. Reason for API Cloning

The API endpoints have been cloned and separated into `/api/json/v1` for consumer use and `/api/json/internal` for internal use. This separation allows for:

1. Independent evolution of internal APIs without affecting the public API contract.
2. Enhanced security by restricting access to internal endpoints.
3. Potential optimization of internal endpoints for specific use cases.
4. Easier management and maintenance of consumer-facing and internal APIs.

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application, while understanding the distinction between consumer-facing and internal APIs.

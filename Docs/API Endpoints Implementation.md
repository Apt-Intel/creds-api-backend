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

#### 3. Middlewares Implementation

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

##### 3.6 Complex Rate Limit Middleware

**File:** `middlewares/complexRateLimitMiddleware.js`

```js
const { client } = require("../config/redisClient");
const logger = require("../config/logger");

const WINDOW_SIZE_IN_SECONDS = 10;
const MAX_REQUESTS_PER_WINDOW = 50;

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

module.exports = complexRateLimitMiddleware;
```

#### 4. Dynamic Pagination Implementation

The API implements dynamic pagination across all endpoints using a standardized approach.

##### 4.1 Pagination Configuration

**File:** `config/constants.js`

```js
module.exports = {
  // Pagination Constants
  DEFAULT_PAGE_SIZE: 50,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 50,
  // ... other constants
};
```

##### 4.2 Pagination Utilities

**File:** `utils/paginationUtils.js`

```js
const getPaginationParams = (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const validatedPage = Math.max(1, parseInt(page, 10) || 1);
  const validatedPageSize = Math.min(
    Math.max(parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  const skip = (validatedPage - 1) * validatedPageSize;
  const limit = validatedPageSize;

  return { limit, skip };
};

const validatePaginationParams = (page, pageSize) => {
  // Validation logic for pagination parameters
};
```

##### 4.3 Response Structure Utilities

**File:** `utils/responseUtils.js`

```js
const createPaginatedResponse = ({
  total,
  page,
  pageSize,
  results,
  metadata = {},
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    pagination: {
      total_items: total,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
      has_next_page: hasNextPage,
      has_previous_page: hasPreviousPage,
      next_page: hasNextPage ? page + 1 : null,
      previous_page: hasPreviousPage ? page - 1 : null,
    },
    metadata,
    results,
  };
};

const createBulkPaginatedResponse = ({
  totalResults,
  page,
  pageSize,
  results,
  metadata = {},
}) => {
  // Bulk response structure with pagination
};
```

##### 4.4 Controller Implementation Pattern

Controllers should follow this pattern for handling pagination:

```js
async function searchEndpoint(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;

  // Validate pagination parameters
  const paginationValidation = validatePaginationParams(page, pageSize);
  if (!paginationValidation.isValid) {
    return res.status(400).json({ errors: paginationValidation.errors });
  }

  // Get pagination parameters
  const { limit, skip } = getPaginationParams(page, pageSize);

  // Execute query with pagination
  const [results, total] = await Promise.all([
    collection.find(query).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  // Create paginated response
  const response = createPaginatedResponse({
    total,
    page,
    pageSize: limit,
    results,
    metadata: {
      // Additional metadata
    },
  });

  req.searchResults = response;
  next();
}
```

##### 4.5 Bulk Operation Pattern

For bulk operations, use this pattern:

```js
async function bulkSearchEndpoint(req, res, next) {
  const { items } = req.body;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;

  // Validation and pagination setup
  const { limit, skip } = getPaginationParams(page, pageSize);

  // Execute bulk queries
  const searchResults = await Promise.all(
    items.map(async (item) => {
      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);
      return { item, total, data: results };
    })
  );

  // Create bulk paginated response
  const response = createBulkPaginatedResponse({
    totalResults,
    page,
    pageSize: limit,
    results: searchResults,
    metadata: {
      // Additional metadata
    },
  });

  req.searchResults = response;
  next();
}
```

#### 5. Endpoint Response Structures

##### 5.1 Single Search Response

```json
{
  "pagination": {
    "total_items": 100,
    "total_pages": 5,
    "current_page": 2,
    "page_size": 20,
    "has_next_page": true,
    "has_previous_page": true,
    "next_page": 3,
    "previous_page": 1
  },
  "metadata": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    }
  },
  "results": [
    // Array of results
  ]
}
```

##### 5.2 Bulk Search Response

```json
{
  "pagination": {
    "total_items": 150,
    "current_page": 1,
    "page_size": 20
  },
  "metadata": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "results": [
    {
      "item": "search_item",
      "total": 50,
      "pagination": {
        "total_items": 50,
        "total_pages": 3,
        "current_page": 1,
        "page_size": 20
      },
      "data": [
        // Array of results
      ]
    }
  ]
}
```

#### 6. Error Handling for Pagination

##### 6.1 Invalid Page Number

```json
{
  "errors": ["Invalid 'page' parameter. Must be a positive integer."]
}
```

##### 6.2 Invalid Page Size

```json
{
  "errors": [
    "Invalid 'page_size' parameter. Must be an integer between 1 and 50."
  ]
}
```

#### 7. Guidelines for Implementing New API Routes

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

#### 8. Best Practices

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
- Implement thorough input validation for all parameters.
- Use `validator` library for input validation and sanitization.
- Implement detailed logging for better traceability and debugging.
- Handle errors gracefully and provide meaningful error messages.
- Use environment variables to control the level of error details exposed in production.

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application.

#### 9. Current File Structure

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

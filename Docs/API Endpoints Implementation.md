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

#### 4. Controller Implementation Pattern

##### 4.1 Standard Controller Pattern

```javascript
async function controllerFunction(req, res, next) {
  const startTime = performance.now();
  try {
    // 1. Extract and validate parameters
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
    const sortby = req.query.sortby || "date_compromised";
    const sortorder = req.query.sortorder || "desc";
    const type = req.query.type || "strict";

    // 2. Validate parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      throw errorUtils.validationError("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
    }

    // 3. Execute query
    const { limit, skip } = getPaginationParams(page, pageSize);
    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    // 4. Set searchResults for middleware processing
    req.searchResults = {
      meta: {
        // Changed from metadata to meta
        query_type: type,
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
      total,
      page,
      pageSize,
      data: results,
    };

    next();
  } catch (error) {
    next(error);
  }
}
```

##### 4.2 Bulk Controller Pattern

```javascript
async function bulkControllerFunction(req, res, next) {
  const startTime = performance.now();
  try {
    // Similar parameter extraction and validation...

    // Process each item
    const searchResults = await Promise.all(
      items.map(async (item) => {
        const [results, total] = await Promise.all([
          collection.find(query).skip(skip).limit(limit).toArray(),
          collection.countDocuments(query),
        ]);

        return {
          identifier: item, // mail, domain, or login
          pagination: {
            total_items: total,
            total_pages: Math.ceil(total / pageSize),
            current_page: page,
            page_size: pageSize,
            has_next_page: skip + limit < total,
            has_previous_page: page > 1,
            next_page: skip + limit < total ? page + 1 : null,
            previous_page: page > 1 ? page - 1 : null,
          },
          data: results,
        };
      })
    );

    // Set searchResults
    req.searchResults = {
      meta: {
        // Changed from metadata to meta
        query_type: type,
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
      search_counts: Object.fromEntries(
        searchResults.map((result) => [
          result.identifier,
          result.pagination.total_items,
        ])
      ),
      total: searchResults.reduce(
        (sum, result) => sum + result.pagination.total_items,
        0
      ),
      page,
      pageSize,
      data: searchResults,
    };

    next();
  } catch (error) {
    next(error);
  }
}
```

#### 5. Response Structures

##### 5.1 V1 Single Search Response

```json
{
  "meta": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 17,
  "page": 1,
  "pageSize": 5,
  "data": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [...],
      "ExternalCredentials": [...],
      "CustomerCredentials": [...],
      "OtherCredentials": [...]
    }
  ]
}
```

##### 5.2 V1 Bulk Search Response

```json
{
  "meta": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "234.56ms"
  },
  "search_counts": {
    "identifier1": 100,
    "identifier2": 50
  },
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "data": [
    {
      "identifier": "identifier1",
      "pagination": {
        "total_items": 100,
        "total_pages": 2,
        "current_page": 1,
        "page_size": 50,
        "has_next_page": true,
        "has_previous_page": false,
        "next_page": 2,
        "previous_page": null
      },
      "data": [...]
    }
  ]
}
```

##### 5.3 Internal Routes Response

```json
{
  "meta": {
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 17,
  "page": 1,
  "pageSize": 5,
  "data": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "Credentials": [...]
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

#### 8. Error Handling Implementation

##### 8.1 Error Handler Middleware

```javascript
const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = ERROR_CODES[statusCode] || "UNKNOWN_ERROR";

  const errorResponse = {
    meta: {
      error: {
        code: errorCode,
        message: err.message || "An unexpected error occurred",
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : {
                stack: err.stack,
                requestId: req.requestId,
              },
      },
    },
    data: null,
  };

  res.status(statusCode).json(errorResponse);
};
```

##### 8.2 Error Utility Functions

```javascript
const createAPIError = (message, statusCode = 500, details = {}) => {
  return new APIError(message, statusCode, details);
};

class APIError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
```

#### 9. Rate Limiting Implementation

##### 9.1 Basic Rate Limiter

```javascript
const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: (req) => req.apiKeyData.rate_limit || 1000,
  keyGenerator: (req) => `rate-limit:${req.apiKeyData.id}`,
});
```

##### 9.2 Complex Rate Limiter

```javascript
const complexRateLimitMiddleware = async (req, res, next) => {
  try {
    if (req.path === USAGE_ENDPOINT) {
      return next();
    }

    await updateUsageStats(req);
    next();
  } catch (error) {
    if (error instanceof UsageLimitExceededError) {
      res.set("Retry-After", error.retryAfter);
      return res.status(429).json({
        meta: {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Your ${error.limitType} usage limit has been exceeded.`,
            retryAfter: error.retryAfter,
          },
        },
        data: null,
      });
    }
    next(error);
  }
};
```

#### 10. Usage Tracking Implementation

##### 10.1 Usage Service

```javascript
const updateUsageStats = async (req) => {
  const apiKeyId = req.apiKeyData.id;
  const now = new Date();

  // Update daily and monthly usage
  await Promise.all([
    updateDailyUsage(apiKeyId, now),
    updateMonthlyUsage(apiKeyId, now),
  ]);

  // Check limits
  await checkUsageLimits(apiKeyId);
};
```

##### 10.2 Usage Endpoint Implementation

```javascript
router.get("/usage", async (req, res) => {
  try {
    const apiKeyId = req.apiKeyData.id;
    const usageStats = await getUsageStats(apiKeyId);

    res.json({
      remaining_daily_requests: usageStats.remaining_daily_requests,
      remaining_monthly_requests: usageStats.remaining_monthly_requests,
      total_daily_limit: usageStats.daily_limit,
      total_monthly_limit: usageStats.monthly_limit,
      current_daily_usage: usageStats.daily_requests,
      current_monthly_usage: usageStats.monthly_requests,
      status: usageStats.status,
    });
  } catch (error) {
    next(error);
  }
});
```

#### 11. Best Practices for Implementation

##### 11.1 Controller Implementation

- Use async/await for asynchronous operations
- Implement proper error handling using try/catch
- Use the standard response structure
- Include request timing measurements
- Log important operations

##### 11.2 Middleware Implementation

- Keep middleware focused on a single responsibility
- Use next(error) for error propagation
- Implement proper logging
- Handle edge cases appropriately

##### 11.3 Route Implementation

- Use proper HTTP methods
- Implement proper middleware chain
- Include all necessary validations
- Follow RESTful naming conventions

##### 11.4 Error Handling

- Use standardized error responses
- Include appropriate error codes
- Provide meaningful error messages
- Handle all possible error scenarios

##### 11.5 Security Best Practices

- Validate all input parameters
- Implement proper rate limiting
- Use secure headers
- Implement proper authentication checks

By following these guidelines and examples, new engineers can effectively implement and maintain API endpoints, routes, controllers, and middlewares in this application.

#### 12. Current File Structure

```
creds-api-backend
├── app.js
├── config/
│   ├── constants.js
│   ├── database.js
│   ├── logger.js
│   └── redisClient.js
├── controllers/
│   ├── v1/
│   │   ├── mailController.js
│   │   ├── mailBulkController.js
│   │   ├── domainController.js
│   │   └── domainBulkController.js
│   └── internal/
│       ├── loginController.js
│       ├── loginBulkController.js
│       ├── domainController.js
│       └── domainBulkController.js
├── middlewares/
│   ├── apiKeyDataMiddleware.js
│   ├── authMiddleware.js
│   ├── complexRateLimitMiddleware.js
│   ├── dateNormalizationMiddleware.js
│   ├── documentRedesignMiddleware.js
│   ├── documentRedesignDomainMiddleware.js
│   ├── errorHandlerMiddleware.js
│   ├── rateLimiter.js
│   ├── requestIdMiddleware.js
│   ├── requestLogger.js
│   ├── sendResponseMiddleware.js
│   └── sortingMiddleware.js
├── routes/
│   └── api/
│       ├── v1/
│       │   ├── searchByMail.js
│       │   ├── searchByMailBulk.js
│       │   ├── searchByDomain.js
│       │   ├── searchByDomainBulk.js
│       │   └── usage.js
│       └── internal/
│           ├── searchByLogin.js
│           ├── searchByLoginBulk.js
│           ├── searchByDomain.js
│           └── searchByDomainBulk.js
├── services/
│   ├── apiKeyService.js
│   ├── dateService.js
│   └── loggingService.js
├── utils/
│   ├── apiKeyUtils.js
│   ├── domainUtils.js
│   ├── errorUtils.js
│   ├── hashUtils.js
│   ├── paginationUtils.js
│   └── responseUtils.js
└── .env
```

#### 13. Middleware Chain Implementation

##### 13.1 V1 Routes Middleware Chain

```javascript
router.get(
  "/endpoint-path",
  requestIdMiddleware, // Add request ID
  authMiddleware, // API key validation
  apiKeyDataMiddleware, // Attach API key data
  rateLimiter, // Basic rate limiting
  complexRateLimitMiddleware, // Usage-based rate limiting
  requestLogger, // Request logging
  controllerFunction, // Main controller logic with DB-level sorting
  sortingMiddleware, // Sort parameter validation
  documentRedesignMiddleware, // Credential segregation (v1 routes only)
  sendResponseMiddleware // Standard response formatting
);
```

##### 13.2 Internal Routes Middleware Chain

```javascript
router.get(
  "/endpoint-path",
  requestIdMiddleware, // Add request ID
  authMiddleware, // API key validation
  apiKeyDataMiddleware, // Attach API key data
  rateLimiter, // Basic rate limiting
  complexRateLimitMiddleware, // Usage-based rate limiting
  requestLogger, // Request logging
  controllerFunction, // Main controller logic with DB-level sorting
  sortingMiddleware, // Sort parameter validation
  sendResponseMiddleware // Standard response formatting
);
```

#### 14. API Key Implementation

##### 14.1 API Key Service

```javascript
const getApiKeyDetails = async (apiKey) => {
  // Get API key details including:
  // - Rate limits
  // - Usage limits
  // - Allowed endpoints
  // - Status
  return apiKeyData;
};

const updateApiKeyDetails = async (apiKey, updates) => {
  // Update API key configuration
  return updatedApiKeyData;
};
```

##### 14.2 Usage Tracking

```javascript
const updateUsageStats = async (req) => {
  const apiKeyId = req.apiKeyData.id;

  // Update usage statistics
  await Promise.all([updateDailyUsage(apiKeyId), updateMonthlyUsage(apiKeyId)]);

  // Check limits
  await checkUsageLimits(apiKeyId);
};
```

#### 15. Detailed Implementation Guidelines

##### 15.1 Controller Implementation Details

###### Input Validation Pattern

```javascript
const validateSearchParams = (params) => {
  const { mail, type, sortby, sortorder, page, pageSize } = params;

  // Validate required fields
  if (!mail) {
    throw errorUtils.validationError("Mail parameter is required");
  }

  // Validate email format
  if (!validator.isEmail(mail)) {
    throw errorUtils.validationError("Invalid email format", {
      parameter: "mail",
      received: mail,
    });
  }

  // Validate type parameter
  const validTypes = ["strict", "all"];
  if (type && !validTypes.includes(type)) {
    throw errorUtils.validationError("Invalid type parameter", {
      parameter: "type",
      received: type,
      allowed: validTypes,
    });
  }

  // Validate sort parameters
  const validSortBy = ["date_compromised", "date_uploaded"];
  if (sortby && !validSortBy.includes(sortby)) {
    throw errorUtils.validationError("Invalid sortby parameter", {
      parameter: "sortby",
      received: sortby,
      allowed: validSortBy,
    });
  }
};
```

###### Query Building Pattern

```javascript
const buildSearchQuery = (params) => {
  const { mail, type } = params;

  // Build base query
  const query = type === "strict" ? { Employee: mail } : { Emails: mail };

  // Add additional filters if needed
  if (params.installed_software) {
    query.installed_software = true;
  }

  return query;
};
```

###### Error Handling Pattern

```javascript
const handleControllerError = (error, req) => {
  logger.error("Controller error:", {
    error: error.message,
    stack: error.stack,
    requestId: req.requestId,
  });

  if (error.name === "ValidationError") {
    throw errorUtils.validationError(error.message, error.details);
  }

  if (error.name === "MongoError" && error.code === 11000) {
    throw errorUtils.conflictError("Duplicate key error");
  }

  throw errorUtils.serverError("Internal server error", {
    originalError: error.message,
  });
};
```

##### 15.2 Middleware Implementation Details

###### Rate Limiting Configuration

```javascript
const rateLimiterConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    enableOfflineQueue: false,
  },
  keyPrefix: "ratelimit:",
  points: 10, // Number of points
  duration: 1, // Per second(s)
  blockDuration: 600, // Block duration in seconds
  inmemoryBlockOnConsumed: 301, // Block if consumed more than 300 points
  inmemoryBlockDuration: 600,
  clearExpiredKeysInterval: undefined, // Disabled
  execEvenly: false, // Do not delay actions evenly
  keyGenerator: (req) => {
    return `${req.ip}-${req.apiKeyData.id}`;
  },
};
```

###### Error Propagation Pattern

```javascript
const errorPropagationMiddleware = (middleware) => async (req, res, next) => {
  try {
    await middleware(req, res, next);
  } catch (error) {
    logger.error("Middleware error:", {
      middleware: middleware.name,
      error: error.message,
      requestId: req.requestId,
    });

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};
```

###### Middleware Chain Builder

```javascript
const buildMiddlewareChain = (isV1Route = true) => {
  const chain = [
    requestIdMiddleware,
    authMiddleware,
    apiKeyDataMiddleware,
    rateLimiter,
    complexRateLimitMiddleware,
    requestLogger,
    dateNormalizationMiddleware,
    sortingMiddleware,
  ];

  if (isV1Route) {
    chain.push(documentRedesignMiddleware);
  }

  chain.push(sendResponseMiddleware);

  return chain.map((middleware) => errorPropagationMiddleware(middleware));
};
```

#### 16. Database Query Implementation

##### 16.1 Query Building Patterns

```javascript
const buildQuery = (params, type = "strict") => {
  // For mail searches
  if (params.mail) {
    return type === "strict"
      ? { Employee: params.mail }
      : { Emails: params.mail };
  }

  // For domain searches
  if (params.domain) {
    return type === "strict"
      ? { Domains: params.domain }
      : { "Credentials.URL": new RegExp(params.domain, "i") };
  }

  // For login searches (internal)
  if (params.login) {
    return { "Credentials.Username": params.login };
  }
};
```

##### 16.2 Query Execution Pattern

```javascript
const executeQuery = async (query, pagination) => {
  const { limit, skip } = pagination;

  return Promise.all([
    collection.find(query).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);
};
```

##### 16.3 Bulk Query Execution

```javascript
const executeBulkQueries = async (items, queryBuilder, pagination) => {
  return Promise.all(
    items.map(async (item) => {
      const query = queryBuilder(item);
      const [results, total] = await executeQuery(query, pagination);

      return {
        identifier: item,
        total,
        data: results,
      };
    })
  );
};
```

#### 17. Response Formatting Implementation

##### 17.1 Response Structure Builder

```javascript
const buildResponse = (results, metadata, timing) => {
  return {
    meta: {
      ...metadata,
      processing_time: `${timing.toFixed(2)}ms`,
    },
    ...results,
  };
};
```

##### 17.2 Bulk Response Builder

```javascript
const buildBulkResponse = (searchResults, metadata, timing) => {
  return {
    meta: {
      ...metadata,
      processing_time: `${timing.toFixed(2)}ms`,
    },
    search_counts: Object.fromEntries(
      searchResults.map((result) => [result.identifier, result.total])
    ),
    total: searchResults.reduce((sum, result) => sum + result.total, 0),
    data: searchResults,
  };
};
```

#### 18. Logging Implementation

##### 18.1 Request Logging

```javascript
const logRequest = (req) => {
  logger.info("API Request", {
    method: req.method,
    path: req.path,
    query: sanitizeLogData(req.query),
    body: sanitizeLogData(req.body),
    requestId: req.requestId,
    apiKeyId: req.apiKeyData?.id,
  });
};
```

##### 18.2 Response Logging

```javascript
const logResponse = (req, responseTime) => {
  logger.info("API Response", {
    method: req.method,
    path: req.path,
    requestId: req.requestId,
    responseTime: `${responseTime}ms`,
    statusCode: res.statusCode,
  });
};
```

##### 18.3 Error Logging

```javascript
const logError = (error, req) => {
  logger.error("API Error", {
    error: error.message,
    stack: error.stack,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
  });
};
```

#### 19. Testing Implementation Patterns

##### 19.1 Controller Test Pattern

```javascript
describe("Controller Tests", () => {
  const mockReq = {
    query: {},
    body: {},
    apiKeyData: { id: "test-api-key" },
    requestId: "test-request-id",
  };

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle valid search request", async () => {
    mockReq.query = {
      mail: "test@example.com",
      page: "1",
      pageSize: "50",
    };

    await searchByMail(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.searchResults).toBeDefined();
    expect(mockReq.searchResults.meta).toBeDefined();
  });
});
```

##### 19.2 Middleware Test Pattern

```javascript
describe("Middleware Tests", () => {
  const mockReq = {
    searchResults: {
      data: [
        {
          "Log date": "2023-07-23",
          Credentials: [],
        },
      ],
    },
  };

  it("should normalize dates correctly", async () => {
    await dateNormalizationMiddleware(mockReq, {}, () => {});

    expect(mockReq.searchResults.data[0]["Log date"]).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
  });
});
```

#### 20. Security Implementation

##### 20.1 Input Sanitization

```javascript
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return validator.escape(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === "object" && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
    );
  }
  return input;
};
```

##### 20.2 API Key Validation

```javascript
const validateApiKey = async (apiKey) => {
  // Hash the API key
  const hashedKey = await hashApiKey(apiKey);

  // Check against database
  const apiKeyData = await ApiKey.findOne({
    where: { hashedKey },
    include: ["usageLimits", "permissions"],
  });

  if (!apiKeyData) {
    throw new APIError("Invalid API key", 401);
  }

  // Check if key is active
  if (apiKeyData.status !== "active") {
    throw new APIError("API key is not active", 403);
  }

  return apiKeyData;
};
```

#### 21. Performance Optimization

##### 21.1 Query Optimization

```javascript
const optimizeQuery = (query, options = {}) => {
  // Add necessary indexes
  const indexes = [];

  if (query.Employee) {
    indexes.push({ Employee: 1 });
  }

  if (query.Domains) {
    indexes.push({ Domains: 1 });
  }

  if (query["Credentials.URL"]) {
    indexes.push({ "Credentials.URL": 1 });
  }

  // Add query hints
  const queryOptions = {
    hint: indexes[0],
    explain: process.env.NODE_ENV === "development",
  };

  return { query, queryOptions };
};
```

##### 21.2 Response Caching

```javascript
const cacheResponse = async (key, data, ttl = 3600) => {
  try {
    const cacheKey = `cache:${key}`;
    await redisClient.setex(
      cacheKey,
      ttl,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    logger.error("Cache error:", error);
  }
};

const getCachedResponse = async (key) => {
  try {
    const cacheKey = `cache:${key}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;

      logger.info("Cache hit", {
        key: cacheKey,
        age: `${age}ms`,
      });

      return parsed.data;
    }
  } catch (error) {
    logger.error("Cache retrieval error:", error);
  }

  return null;
};
```

##### 21.3 Bulk Operation Optimization

```javascript
const optimizeBulkOperation = async (items, operation) => {
  const batchSize = 5;
  const results = [];

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(operation);

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches if needed
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};
```

#### 22. Monitoring Implementation

##### 22.1 Health Check Pattern

```javascript
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();

    // Check Redis connection
    const redisStatus = await checkRedisConnection();

    // Check other dependencies
    const dependencyStatus = await checkDependencies();

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        dependencies: dependencyStatus,
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      error: error.message,
    });
  }
};
```

##### 22.2 Service Status Checks

```javascript
const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    return { status: "OK", latency: `${latency}ms` };
  } catch (error) {
    return { status: "ERROR", error: error.message };
  }
};

const checkRedisConnection = async () => {
  try {
    const startTime = performance.now();
    await redisClient.ping();
    const latency = performance.now() - startTime;

    return {
      status: "OK",
      latency: `${latency.toFixed(2)}ms`,
    };
  } catch (error) {
    return { status: "ERROR", error: error.message };
  }
};
```

#### 23. Graceful Shutdown Implementation

##### 23.1 Shutdown Handler

```javascript
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Stop accepting new requests
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Close database connections
    await Promise.all([sequelize.close(), closeDatabase(), redisClient.quit()]);

    // Cleanup scheduled jobs
    await shutdownScheduledJobs();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
};
```

##### 23.2 Process Handlers

```javascript
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection:", {
    reason,
    stack: reason.stack,
  });
  gracefulShutdown("unhandledRejection");
});
```

#### 24. Documentation Generation

##### 24.1 API Documentation Generator

```javascript
const generateApiDocs = () => {
  const routes = [];

  // Collect all routes
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods);

      routes.push({
        path,
        methods,
        middleware: middleware.route.stack
          .map((layer) => layer.name)
          .filter((name) => name !== "<anonymous>"),
      });
    }
  });

  // Generate documentation
  return routes.map((route) => ({
    endpoint: route.path,
    methods: route.methods,
    middleware: route.middleware,
    authentication: route.middleware.includes("authMiddleware"),
    rateLimiting: route.middleware.includes("rateLimiter"),
  }));
};
```

##### 24.2 Response Example Generator

```javascript
const generateResponseExamples = (route) => {
  const examples = {
    success: {
      meta: {
        query_type: "strict",
        sort: {
          field: "date_compromised",
          order: "desc",
        },
        processing_time: "123.45ms",
      },
      total: 17,
      page: 1,
      pageSize: 5,
      data: [
        /* Example data */
      ],
    },
    error: {
      meta: {
        error: {
          code: "BAD_REQUEST",
          message: "Invalid parameters",
          details: {
            /* Example details */
          },
        },
      },
      data: null,
    },
  };

  return examples;
};
```

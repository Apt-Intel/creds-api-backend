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

#### 2.3 External Search By Domain Endpoint

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

#### 2.4 External Search By Domain Bulk Endpoint

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
  - `"strict"`: Searches in the `"Employee"` field
  - `"all"`: Searches in the `"Emails"` field
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

#### 4. Controllers Implementation

Controllers are organized in separate directories for `v1` and `internal` APIs. They handle the business logic for each route.

##### 4.1 V1 Mail Controller

**File:** `controllers/v1/mailController.js`

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const validator = require("validator");

async function searchByMail(req, res, next) {
  const mail = req.body.mail || req.query.mail;
  const page = parseInt(req.query.page, 10);
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Search initiated for mail: ${mail}, page: ${page}, installed_software: ${installedSoftware}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  try {
    // Validate 'mail' parameter
    if (!mail || !validator.isEmail(mail)) {
      logger.warn(`Invalid mail parameter: ${mail}`);
      return res
        .status(400)
        .json({ error: "Valid mail parameter is required" });
    }

    // Sanitize 'mail' parameter
    const sanitizedMail = validator.escape(mail);

    // Validate 'page' parameter
    if (isNaN(page) || page < 1) {
      logger.warn(`Invalid page parameter: ${req.query.page}`);
      return res.status(400).json({ error: "Invalid 'page' parameter" });
    }

    // Validate 'type' parameter
    const validTypes = ["strict", "all"];
    if (!validTypes.includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return res.status(400).json({ error: "Invalid 'type' parameter" });
    }

    // Validate 'sortby' parameter
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      logger.warn(`Invalid sortby parameter: ${sortby}`);
      return res.status(400).json({ error: "Invalid 'sortby' parameter" });
    }

    // Validate 'sortorder' parameter
    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      logger.warn(`Invalid sortorder parameter: ${sortorder}`);
      return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    // Use parameterized query
    const query =
      type === "all" ? { Emails: sanitizedMail } : { Employee: sanitizedMail };
    const { limit, skip } = getPaginationParams(page);

    // TODO: Implement projection to limit returned fields
    // This will optimize query performance and reduce data transfer
    // Example: const projection = { _id: 0, Emails: 1, Employee: 1, "Log date": 1, Date: 1 };
    // Discuss with the product team to determine which fields are necessary

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
      `Search completed for mail: ${sanitizedMail}, total results: ${total}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMail:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
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
const validator = require("validator");

async function searchByMailBulk(req, res, next) {
  const startTime = performance.now();
  const { mails } = req.body;
  const page = parseInt(req.query.page, 10);
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Bulk search request received for ${mails?.length} mails, page: ${page}, installed_software: ${installedSoftware}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  try {
    // Validate 'mails' parameter
    if (!Array.isArray(mails) || mails.length === 0 || mails.length > 10) {
      logger.warn("Invalid input: mails array", { mailCount: mails?.length });
      return res.status(400).json({
        error: "Invalid mails array. Must contain 1-10 email addresses.",
      });
    }

    // Validate each email in the 'mails' array
    const invalidEmails = mails.filter((email) => !validator.isEmail(email));
    if (invalidEmails.length > 0) {
      logger.warn("Invalid email formats detected", { invalidEmails });
      return res.status(400).json({
        error: "Invalid email formats",
        invalidEmails,
      });
    }

    // Sanitize each email in the 'mails' array
    const sanitizedMails = mails.map((email) => validator.escape(email));

    // Validate 'page' parameter
    if (isNaN(page) || page < 1) {
      logger.warn(`Invalid page parameter: ${req.query.page}`);
      return res.status(400).json({ error: "Invalid 'page' parameter" });
    }

    // Validate 'type' parameter
    const validTypes = ["strict", "all"];
    if (!validTypes.includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return res.status(400).json({ error: "Invalid 'type' parameter" });
    }

    // Validate 'sortby' parameter
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      logger.warn(`Invalid sortby parameter: ${sortby}`);
      return res.status(400).json({ error: "Invalid 'sortby' parameter" });
    }

    // Validate 'sortorder' parameter
    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      logger.warn(`Invalid sortorder parameter: ${sortorder}`);
      return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = sanitizedMails.map(async (mail) => {
      // Use parameterized query
      const query = type === "all" ? { Emails: mail } : { Employee: mail };
      const { limit, skip } = getPaginationParams(page);

      // TODO: Implement projection to limit returned fields
      // This will optimize query performance and reduce data transfer
      // Example: const projection = { _id: 0, Emails: 1, Employee: 1, "Log date": 1, Date: 1 };
      // Discuss with the product team to determine which fields are necessary

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
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

module.exports = {
  searchByMailBulk,
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
- Implement thorough input validation for all parameters.
- Use `validator` library for input validation and sanitization.
- Implement detailed logging for better traceability and debugging.
- Handle errors gracefully and provide meaningful error messages.
- Use environment variables to control the level of error details exposed in production.

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

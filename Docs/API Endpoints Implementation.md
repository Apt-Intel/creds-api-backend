## API Endpoints and Routes Documentation

This document provides a detailed overview of the API endpoints, routes, middlewares, and controllers in the application. It also includes guidelines for implementing new API routes, controllers, and middlewares.

### 1. API Versioning

Our API uses versioning to ensure backward compatibility as we evolve the API. The current version is **v1**, which is reflected in the URL structure: `/api/json/v1/`. We have also introduced internal endpoints under `/api/json/internal/` for internal use.

---

### 2. API Endpoints and Routes Implementation

API endpoints and routes are defined in the `routes` directory. Each route file corresponds to a specific feature or resource.

#### 2.1 Search By Mail Endpoint

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

#### 2.2 Search By Mail Bulk Endpoint

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

[... Keep the rest of the existing content for other endpoints ...]

### 3. Middlewares Implementation

[... Keep the existing content for middlewares ...]

### 4. Controllers Implementation

Controllers are organized in separate directories for `v1` and `internal` APIs. They handle the business logic for each route.

#### 4.1 V1 Mail Controller

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

#### 4.2 V1 Mail Bulk Controller

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

### 5. New Date Normalization, Sorting, and Document Redesign Flow

The flow for date normalization, sorting, and document redesign remains the same for both v1 and internal APIs:

1. **Controller** fetches raw data from the database.
2. **Date Normalization Middleware** normalizes the `"Log date"` and `"Date"` fields.
3. **Sorting Middleware** sorts the normalized data based on query parameters.
4. **Document Redesign Middleware** processes the documents to redesign the structure.
5. **Send Response Middleware** sends the final response.

This flow allows for better separation of concerns and makes the code more modular and maintainable. It's applied consistently across both v1 and internal endpoints, ensuring uniform data processing.

### 6. Guidelines for Implementing New API Routes

When implementing new API routes, follow these steps for both v1 and internal APIs:

1. **Determine** if the route is for v1 (consumer-facing) or internal use.
2. **Create** a new file in the appropriate directory:
   - For v1 routes: `routes/api/v1/`
   - For internal routes: `routes/api/internal/`
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

### 7. Best Practices

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

### 8. Current File Structure

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

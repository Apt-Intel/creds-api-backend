# Project Requirement Document

## 1. Clone `search-by-login` and `search-by-login/bulk`

### Objective

Create a copy of `search-by-login` and `search-by-login/bulk` endpoints to a new API route `/api/json/internal/`, while restructuring the existing controller organization.

### Requirements

1. Create a copy of `search-by-login` and `search-by-login/bulk` to a new API Route `/api/json/internal/`
2. All functionalities remain the same:
   - Business logic remains the same (but adapted to the new route)
   - Logging setup remains the same (but adapted to the new route)
3. We are just making a clone of these endpoints; nothing fundamentally changes
4. After this, we should be able to:
   - `GET /api/json/internal/search-by-login`, `POST /api/json/internal/search-by-login` and get exact same responses as we got from `GET /api/json/v1/search-by-login` and `POST /api/json/v1/search-by-login`
   - `POST /api/json/internal/search-by-login/bulk` and get exact same responses as we got from `POST /api/json/v1/search-by-login/bulk`

### Implementation Plan

#### Phase 1: Restructure Existing Controllers and Update /v1 APIs

1. Create New Directory Structure `mkdir -p controllers/v1 controllers/internal  `

2. Move Existing Controllers `mv controllers/loginController.js controllers/v1/loginController.js
mv controllers/loginBulkController.js controllers/v1/loginBulkController.js  `

3. Update Import Paths in Existing Files

   - Update `routes/api/v1/searchByLogin.js`: `javascript
const { searchByLogin } = require("../../../controllers/v1/loginController");     `
   - Update `routes/api/v1/searchByLoginBulk.js`: `javascript
const { searchByLoginBulk } = require("../../../controllers/v1/loginBulkController");     `

4. Update `app.js` ```javascript
   const v1SearchByLoginRouter = require("./routes/api/v1/searchByLogin");
   const v1SearchByLoginBulkRouter = require("./routes/api/v1/searchByLoginBulk");

   // ... existing code ...

   app.use("/api/json/v1", v1SearchByLoginRouter);
   app.use("/api/json/v1", v1SearchByLoginBulkRouter); ```

5. Test Existing /v1 APIs
   Run the existing test suite to ensure /v1 APIs function correctly with the new structure.

#### Phase 2: Clone APIs to /internal

1.  Create New Internal Controllers

    - Create `controllers/internal/loginController.js`: ```javascript
      const { getDatabase } = require("../../config/database");
      const logger = require("../../config/logger");
      const { getPaginationParams } = require("../../utils/paginationUtils");

      async function internalSearchByLogin(req, res, next) {
      const login = req.body.login || req.query.login;
      const page = parseInt(req.query.page) || 1;
      const installedSoftware = req.query.installed_software === "true";
      const route = req.baseUrl + req.path;

      logger.info(
      `Internal search initiated for login: ${login}, page: ${page}, installed_software: ${installedSoftware}, route: ${route}`
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
            `Internal search completed for login: ${login}, total results: ${total}, route: ${route}`
          );

          req.searchResults = response;
          next();

      } catch (error) {
      logger.error(`Error in internalSearchByLogin: ${error}, route: ${route}`);
      res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
      }
      }

      module.exports = {
      internalSearchByLogin,
      }; ```

    - Create `controllers/internal/loginBulkController.js` with similar structure for bulk operations.

2.  Create New Internal Route Files

    - Create `routes/api/internal/searchByLogin.js`: ```javascript
      const express = require("express");
      const router = express.Router();
      const { internalSearchByLogin } = require("../../../controllers/internal/loginController");
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

      module.exports = router; ```

    - Create `routes/api/internal/searchByLoginBulk.js` with similar structure for bulk operations.

3.  Update `app.js` to Include New Internal Routes ```javascript
    const internalSearchByLoginRouter = require("./routes/api/internal/searchByLogin");
    const internalSearchByLoginBulkRouter = require("./routes/api/internal/searchByLoginBulk");

    // ... existing code ...

    app.use("/api/json/internal", internalSearchByLoginRouter);
    app.use("/api/json/internal", internalSearchByLoginBulkRouter); ```

4.  Update Documentation

    - Update `Docs/API Documentation.md` to include the new internal endpoints.
    - Update `Docs/API Endpoints Implementation.md` to reflect the new structure and internal endpoints.

5.  Testing

    - Create new test files:
      - `__tests__/internalSearchByLogin.test.js`
      - `__tests__/internalSearchByLoginBulk.test.js`
    - Implement tests for the new internal endpoints.
    - Run the full test suite to ensure both v1 and internal endpoints are working correctly.

6.  Code Review
    Submit the changes for code review, ensuring all files are properly updated and the new structure is consistently implemented.

7.  Deployment

    - Deploy the changes to a staging environment.
    - Perform thorough testing on the staging environment.
    - If all tests pass, deploy to the production environment.

8.  Monitoring and Logging
    Update monitoring and logging systems to include the new internal endpoints. Ensure that v1 and internal API calls can be distinguished in logs and metrics.

### Note

This plan restructures the existing controllers and creates new internal APIs while maintaining the functionality of the v1 APIs. The internal APIs are set up with a separate structure that can be modified independently in the future.

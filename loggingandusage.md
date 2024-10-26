# Implementation Plan: Fixing API Management for Rate Limit and Usage Limit

## Overview

**Objectives:**

1. **Ensure atomic operations for usage limits** to prevent race conditions.
2. **Correctly implement per-minute rate limiting** using `express-rate-limit` or an alternative.
3. **Enhance performance** by optimizing database interactions.
4. **Synchronize logging with usage stats** to reflect real-time usage.
5. **Update database schemas** if necessary.
6. **Implement thorough testing** to validate the changes.

## Detailed Implementation Steps

### Step 1: Atomic Operations for Usage Limits

#### **Issue Addressed:**

- Race conditions in usage limits due to non-atomic operations.

#### **Action Items:**

1. **Modify the `api_usage` Table Schema (if necessary):**

   - Ensure that the `api_usage` table includes `daily_limit` and `monthly_limit` columns to store the limits directly.
   - Add any necessary constraints to support atomic operations.

   **Schema Update (if needed):**

   ```sql
   ALTER TABLE api_usage
   ADD COLUMN IF NOT EXISTS daily_limit INTEGER,
   ADD COLUMN IF NOT EXISTS monthly_limit INTEGER;
   ```

2. **Update the `updateUsageStats` Function:**

   - Perform a single atomic operation that checks the limits and increments the counts.
   - Use PostgreSQL's `RETURNING` clause to check if the update was successful.
   - Handle the case where the limits are exceeded.

   **Code Changes in `services/loggingService.js`:**

   ```javascript
   const pool = require("../config/sequelize"); // Ensure correct import

   async function updateUsageStats(apiKeyId) {
     const client = await pool.connect();
     try {
       const result = await client.query(
         `
         UPDATE api_usage
         SET
           total_requests = total_requests + 1,
           daily_requests = CASE
             WHEN last_request_date = CURRENT_DATE THEN daily_requests + 1
             ELSE 1
           END,
           monthly_requests = CASE
             WHEN DATE_TRUNC('month', last_request_date) = DATE_TRUNC('month', CURRENT_DATE) THEN monthly_requests + 1
             ELSE 1
           END,
           last_request_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP
         WHERE api_key_id = $1
           AND (
             (daily_limit IS NULL OR daily_requests < daily_limit)
             AND (monthly_limit IS NULL OR monthly_requests < monthly_limit)
           )
         RETURNING daily_requests, monthly_requests;
         `,
         [apiKeyId]
       );

       if (result.rows.length === 0) {
         throw new Error("Usage limits exceeded");
       }

       return result.rows[0];
     } catch (error) {
       throw error;
     } finally {
       client.release();
     }
   }
   ```

3. **Handle Errors in `complexRateLimitMiddleware.js`:**

   - Catch the error thrown when limits are exceeded.
   - Return a `429 Too Many Requests` response with a meaningful message.

   **Code Changes in `middlewares/complexRateLimitMiddleware.js`:**

   ```javascript
   const complexRateLimitMiddleware = async (req, res, next) => {
     try {
       const apiKeyData = req.apiKeyData;
       if (!apiKeyData) {
         return res.status(500).json({ error: "Internal server error" });
       }

       // Update usage stats atomically
       try {
         await updateUsageStats(apiKeyData.id);
       } catch (error) {
         if (error.message === "Usage limits exceeded") {
           return res
             .status(429)
             .json({ error: "Daily or monthly usage limit exceeded" });
         } else {
           throw error;
         }
       }

       next();
     } catch (error) {
       res.status(500).json({ error: "Internal server error" });
     }
   };
   ```

4. **Ensure Consistency in Database Transactions:**

   - Wrap related database operations in transactions where necessary.
   - Handle transaction commits and rollbacks appropriately.

### Step 2: Correct Implementation of Per-Minute Rate Limiting

#### **Issue Addressed:**

- Incorrect usage of `express-rate-limit`, leading to ineffective per-minute rate limiting.

#### **Action Items:**

1. **Refactor Rate Limiting Middleware:**

   - Define the rate limiter outside the middleware function to avoid re-creating it for every request.
   - Use the `keyGenerator` option to apply rate limits per API key.
   - Use the `handler` option to customize the response when the rate limit is exceeded.

   **Code Changes in `middlewares/rateLimiter.js`:**

   ```javascript
   const rateLimit = require("express-rate-limit");
   const RedisStore = require("rate-limit-redis");
   const Redis = require("ioredis");

   const redisClient = new Redis({
     host: process.env.REDIS_HOST || "localhost",
     port: process.env.REDIS_PORT || 6379,
   });

   const rateLimiter = rateLimit({
     store: new RedisStore({
       client: redisClient,
     }),
     windowMs: 60000, // 1 minute
     max: (req) => req.apiKeyData.rate_limit || 1000,
     keyGenerator: (req) => req.apiKeyData.id,
     handler: (req, res) => {
       res
         .status(429)
         .json({ error: "Too many requests, please try again later." });
     },
   });

   module.exports = rateLimiter;
   ```

2. **Apply Rate Limiter Middleware Appropriately:**

   - Ensure that the rate limiter is applied after the `authMiddleware` so that `req.apiKeyData` is available.
   - Include the rate limiter in the middleware chain in `app.js`.

   **Code Changes in `app.js`:**

   ```javascript
   const authMiddleware = require("./middlewares/authMiddleware");
   const rateLimiter = require("./middlewares/rateLimiter");
   const complexRateLimitMiddleware = require("./middlewares/complexRateLimitMiddleware");

   app.use(authMiddleware);
   app.use(rateLimiter);
   app.use(complexRateLimitMiddleware);
   ```

3. **Remove the Old Rate Limiting Logic from `complexRateLimitMiddleware.js`:**

   - Since rate limiting is now handled in `rateLimiter.js`, adjust `complexRateLimitMiddleware.js` to focus on usage limits.

   **Updated `complexRateLimitMiddleware.js`:**

   ```javascript
   const { updateUsageStats } = require("../services/loggingService");
   const logger = require("../config/logger");

   const complexRateLimitMiddleware = async (req, res, next) => {
     try {
       const apiKeyData = req.apiKeyData;
       if (!apiKeyData) {
         return res.status(500).json({ error: "Internal server error" });
       }

       // Update usage stats atomically
       try {
         await updateUsageStats(apiKeyData.id);
       } catch (error) {
         if (error.message === "Usage limits exceeded") {
           return res
             .status(429)
             .json({ error: "Daily or monthly usage limit exceeded" });
         } else {
           throw error;
         }
       }

       next();
     } catch (error) {
       logger.error(
         `Unexpected error in complexRateLimitMiddleware: ${error.message}`
       );
       res.status(500).json({ error: "Internal server error" });
     }
   };

   module.exports = complexRateLimitMiddleware;
   ```

### Step 3: Synchronize Logging with Usage Stats

#### **Issue Addressed:**

- Delayed logging may cause usage stats to be outdated during limit checks.

#### **Action Items:**

1. **Decouple Logging from Usage Stats Updates:**

   - Remove usage stats updates from the asynchronous logging process.
   - Ensure usage stats are updated immediately in the `complexRateLimitMiddleware`.

2. **Adjust `loggingService.js` to Focus on Logging Only:**

   - Modify `processLogQueue` to handle only the insertion of logs into the `api_requests_log` table.
   - Remove the loop that updates usage stats for each log.

   **Code Changes in `services/loggingService.js`:**

   ```javascript
   // Remove the usage stats update loop from processLogQueue
   // Keep the log insertion logic
   // Ensure logs are batch inserted efficiently
   ```

3. **Update Usage Stats in `complexRateLimitMiddleware.js`:**

   - As shown in Step 2, usage stats are updated immediately when a request is processed.

### Step 4: Optimize Database Interactions

#### **Issue Addressed:**

- Potential performance issues due to synchronous database calls.

#### **Action Items:**

1. **Ensure Asynchronous Database Operations:**

   - Verify that all database calls use asynchronous patterns (`async/await` or Promises).
   - Avoid blocking operations that can impact performance.

2. **Use Connection Pooling:**

   - Ensure that the database client uses connection pooling for efficient management of database connections.

3. **Optimize Queries:**

   - Review SQL queries for efficiency.
   - Add necessary indexes to support the queries.

   **Index Recommendations:**

   ```sql
   CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
   ```

4. **Monitor Database Performance:**

   - Use monitoring tools to identify slow queries or bottlenecks.
   - Optimize based on findings.

### Step 5: Update Database Schemas (if Necessary)

#### **Action Items:**

1. **Add Constraints to `api_usage` Table:**

   - Ensure that `api_key_id` has a unique constraint if not already in place.

   **Schema Update:**

   ```sql
   ALTER TABLE api_usage
   ADD CONSTRAINT unique_api_key_id UNIQUE (api_key_id);
   ```

2. **Include Limits in `api_usage` Table (Optional):**

   - If desired, store `daily_limit` and `monthly_limit` in the `api_usage` table for direct access.
   - Alternatively, ensure that `api_keys` table provides necessary limit information.

3. **Review and Update Migrations:**

   - Ensure that all schema changes are reflected in migration scripts.
   - Apply migrations to keep development and production databases in sync.

### Step 6: Enhance Error Handling and Logging

#### **Action Items:**

1. **Provide Clear Error Messages:**

   - Ensure that responses for rate limit and usage limit exceedances are consistent and informative.
   - Include relevant headers like `Retry-After` when appropriate.

2. **Improve Logging for Limit Exceedances:**

   - Log instances where limits are exceeded with appropriate details.
   - Include API key IDs, timestamps, and other relevant information.

3. **Update Client-Facing Documentation:**

   - Reflect changes in API documentation.
   - Inform clients about new error responses and headers.

### Step 7: Implement Thorough Testing

#### **Action Items:**

1. **Unit Tests:**

   - Write tests to simulate usage under normal and boundary conditions.
   - Test atomicity of `updateUsageStats` function.
   - Verify that rate limits and usage limits are enforced correctly.

2. **Integration Tests:**

   - Test the entire middleware chain with actual database and Redis connections.
   - Simulate concurrent requests to check for race conditions.

3. **Load Testing:**

   - Perform load testing to assess performance under high traffic.
   - Use tools like JMeter or k6.

4. **Regression Testing:**

   - Ensure that existing functionality is not broken by the changes.
   - Run all existing tests and update them if necessary.

### Step 8: Update Documentation and Communicate Changes

#### **Action Items:**

1. **Update Internal Documentation:**

   - Document the changes in the codebase.
   - Explain the new mechanisms for rate limiting and usage limits.

2. **Update API Documentation for Clients:**

   - Describe new error messages and status codes.
   - Provide guidance on handling `429 Too Many Requests` responses.

3. **Communicate with Stakeholders:**

   - Inform the team and stakeholders about the changes.
   - Prepare to support clients in adapting to any adjustments.

### Step 9: Deployment Strategy

#### **Action Items:**

1. **Staging Environment Testing:**

   - Deploy changes to a staging environment.
   - Run tests and verify that everything works as intended.

2. **Database Migration:**

   - Apply database migrations carefully.
   - Backup the current database before making changes.

3. **Monitor After Deployment:**

   - Monitor logs and performance metrics.
   - Be prepared to roll back if critical issues arise.

## Summary of Changes to Code Files

1. **`services/loggingService.js`:**

   - Modify `updateUsageStats` to perform atomic operations.
   - Remove usage stats updates from `processLogQueue`.

2. **`middlewares/rateLimiter.js`:**

   - Create a new rate limiter middleware using `express-rate-limit` configured correctly.

3. **`middlewares/complexRateLimitMiddleware.js`:**

   - Simplify to focus on usage limits.
   - Use the updated `updateUsageStats` function.
   - Remove per-minute rate limiting logic.

4. **`app.js`:**

   - Adjust middleware order to include `authMiddleware`, `rateLimiter`, and `complexRateLimitMiddleware`.

5. **`database_migrations.sql` (and respective migration files):**

   - Add necessary columns and constraints to support atomic operations and enforce uniqueness.

6. **`services/apiKeyService.js`:**

   - Verify that API key data includes necessary limit information.
   - Update if limits are stored differently.

## Potential Modifications to Database Schemas

- **`api_usage` Table:**

  - Ensure unique constraint on `api_key_id`.
  - Include `daily_limit` and `monthly_limit` if needed.

- **Indexing:**

  - Add indexes on columns used in WHERE clauses and JOINs to optimize queries.

## Final Notes

- **Coordination is Key**: Ensure that all team members are informed and involved in the changes, especially those working on related areas.
- **Backup and Safety**: Always backup databases before applying migrations, and test migrations thoroughly.
- **Client Impact**: Be mindful of how changes may affect clients, and provide support during the transition.
- **Continuous Monitoring**: After deployment, monitor the system continuously to catch any unexpected behavior.

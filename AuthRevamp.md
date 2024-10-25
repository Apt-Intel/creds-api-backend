# Final Plan: Authentication Revamp Implementation

## Objective

Revamp the current authentication system to introduce multiple API keys with granular access control, real-time usage tracking, and per-key rate limiting, while implementing mitigation strategies such as caching, asynchronous logging, efficient database design, and optimized algorithms. Ensure that the overhaul does not change core functionalities of the existing APIs.

## Table of Contents

1. [Overview](#1-overview)
2. [Current Authentication System Review](#2-current-authentication-system-review)
3. [High-Level Architecture Design](#3-high-level-architecture-design)
4. [Database Schema Design](#4-database-schema-design)
5. [Implementation Steps](#5-implementation-steps)
   - [Step 1: Set Up PostgreSQL Database with Supabase](#step-1-set-up-postgresql-database-with-supabase)
   - [Step 2: Implement Database Models and Migrations](#step-2-implement-database-models-and-migrations)
   - [Step 3: Update `authMiddleware.js` for New Authentication Flow](#step-3-update-authmiddlewarejs-for-new-authentication-flow)
   - [Step 4: Implement Caching of API Key Data](#step-4-implement-caching-of-api-key-data)
   - [Step 5: Add Endpoint Access Control per API Key](#step-5-add-endpoint-access-control-per-api-key)
   - [Step 6: Implement Per-Key Rate Limiting](#step-6-implement-per-key-rate-limiting)
   - [Step 7: Implement Asynchronous Logging and Usage Tracking](#step-7-implement-asynchronous-logging-and-usage-tracking)
   - [Step 8: Optimize Database Interactions and Algorithms](#step-8-optimize-database-interactions-and-algorithms)
   - [Step 9: Update Documentation and API Specifications](#step-9-update-documentation-and-api-specifications)
   - [Step 10: Testing and Validation](#step-10-testing-and-validation)
6. [Deployment Strategy](#6-deployment-strategy)
7. [Rollout and Monitoring](#7-rollout-and-monitoring)
8. [Final Considerations](#8-final-considerations)

## 1. Overview

We will enhance the authentication system by introducing:

- Multiple API keys stored securely in a PostgreSQL database hosted on Supabase.
- Per-key endpoint access control (with a special "all" value for full access).
- Real-time tracking of usage statistics and response behaviors for each API key.
- Logging of all requests, including timestamps, IP addresses, and user agents.
- Implementation of mitigation strategies:
  - **Caching**: Reduce database load for API key validation.
  - **Asynchronous Logging**: Prevent logging from impacting request handling.
  - **Efficient Database Design**: Optimize schemas and queries.
  - **Optimized Algorithms**: Ensure all new code is efficient and scalable.

## 2. Current Authentication System Review

### Current State:

- **Authentication Method:** Single API key stored in the `.env` file.
- **Auth Middleware (`middlewares/authMiddleware.js`):** Checks if the provided API key matches the one in the environment variable.
- **Limitations:**
  - Only one API key.
  - No granular access control.
  - No per-key usage tracking or rate limiting.
  - Minimal logging.

### Files to Review:

- `middlewares/authMiddleware.js`
- `Project Specification Document.md` (for understanding current system behavior)
- other code files if needed.

## 3. High-Level Architecture Design

- **Database:** Use PostgreSQL (via Supabase) to store API key data and usage statistics.
- **Caching:** Utilize Redis to cache API key validation results.
- **Authentication Middleware:** Update to validate API keys against the database/cache and enforce permissions.
- **Rate Limiting:** Implement per-key rate limiting using Redis.
- **Logging:** Introduce asynchronous logging to record request details without affecting response times.
- **Usage Tracking:** Update usage statistics in the database asynchronously.

## 4. Database Schema Design

### Tables:

1. **`api_keys`**

   - **Columns:**
     - `id` (UUID, Primary Key)
     - `api_key` (Text, Hashed)
     - `status` (Enum: 'active', 'suspended', 'revoked')
     - `created_at` (Timestamp)
     - `updated_at` (Timestamp)
     - `endpoints_allowed` (JSONB)
     - `rate_limit` (Integer, requests per minute)
     - `metadata` (JSONB, optional info like owner details)

2. **`api_usage`**

   - **Columns:**
     - `id` (Serial, Primary Key)
     - `api_key_id` (UUID, Foreign Key to `api_keys`)
     - `total_requests` (BigInt)
     - `requests_last_hour` (Integer)
     - `updated_at` (Timestamp)

3. **`api_requests_log`**
   - **Columns:**
     - `id` (Serial, Primary Key)
     - `api_key_id` (UUID, Foreign Key)
     - `timestamp` (Timestamp)
     - `endpoint` (Text)
     - `method` (Text)
     - `status_code` (Integer)
     - `response_time_ms` (Integer)
     - `ip_address` (Text)
     - `user_agent` (Text)

### Indexes:

- Index on `api_keys.api_key` for quick lookup.
- Index on `api_requests_log.api_key_id` and `timestamp` for efficient querying.

## 5. Implementation Steps

### Step 1: Set Up PostgreSQL Database with Supabase

1. **Create a Supabase Project:**

   - Sign up and create a new project.
   - Get the connection string (URL, username, password).

2. **Configure Database Connection:**

   - Install PostgreSQL client (`pg` npm package).
   - In `config/database.js`, set up the connection:
     ````javascript
     // config/database.js
     const { Pool } = require('pg');
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
     });
     module.exports = {
       query: (text, params) => pool.query(text, params),
     };     ```
     ````

3. **Update Environment Variables:**

   - Add `DATABASE_URL` to `.env`.

4. **Create Tables:**

   - Use Supabase SQL editor or a migration tool to create the tables as per the schema.

5. **Test Database Connection:**
   - Write a simple script to query the database and ensure connectivity.

### Step 2: Implement Database Models and Migrations

1. **Install an ORM (Optional):**

   - For easier database interaction, install and configure an ORM like Sequelize or Knex.

2. **Define Models for `api_keys`, `api_usage`, and `api_requests_log`.**

3. **Implement Migrations:**

   - Write migration scripts to create and update database tables.

4. **Implement Utility Functions:**
   - In `services/apiKeyService.js`, create functions to:
     - Create new API keys.
     - Fetch an API key by the hashed value.
     - Update API key status or permissions.
     - Increment usage statistics.

### Step 3: Update `authMiddleware.js` for New Authentication Flow

1. **Import Necessary Modules:**

   ````javascript
   const { getApiKeyDetails } = require('../services/apiKeyService');
   const { cacheGet, cacheSet } = require('../services/cacheService');
   const { hashApiKey } = require('../utils/hashUtils');   ```

   ````

2. **Modify Authentication Logic:**

   - **Extract API Key from Headers:**

     ````javascript
     const apiKey = req.headers['api-key'];
     if (!apiKey) {
       return res.status(401).json({ error: 'No API key provided' });
     }     ```

     ````

   - **Hash the API Key:**

     ````javascript
     const hashedApiKey = hashApiKey(apiKey);     ```

     ````

   - **Check Redis Cache First:**

     ````javascript
     let apiKeyData = await cacheGet(`api_key:${hashedApiKey}`);     ```

     ````

   - **If Not in Cache, Fetch from Database:**

     ````javascript
     if (!apiKeyData) {
       apiKeyData = await getApiKeyDetails(hashedApiKey);
       if (!apiKeyData || apiKeyData.status !== 'active') {
         return res.status(401).json({ error: 'Invalid or inactive API key' });
       }
       await cacheSet(`api_key:${hashedApiKey}`, apiKeyData, 3600); // Cache for 1 hour
     }     ```

     ````

   - **Attach API Key Data to Request Object:**
     ````javascript
     req.apiKeyData = apiKeyData;
     next();     ```
     ````

3. **Handle Errors Gracefully:**

   ````javascript
   } catch (error) {
     console.error('Authentication error:', error);
     return res.status(500).json({ error: 'Internal server error' });
   }   ```

   ````

4. **Update `app.js` to Use Updated Middleware:**
   ````javascript
   const authMiddleware = require('./middlewares/authMiddleware');
   app.use(authMiddleware);   ```
   ````

### Step 4: Implement Caching of API Key Data

1. **Set Up Redis Client:**

   - Install `redis` and `util` npm packages.

   - In `services/cacheService.js`:

     ````javascript
     const redis = require('redis');
     const { promisify } = require('util');

     const client = redis.createClient();
     client.on('error', console.error);

     const getAsync = promisify(client.get).bind(client);
     const setAsync = promisify(client.setex).bind(client);

     module.exports = {
       cacheGet: async (key) => JSON.parse(await getAsync(key)),
       cacheSet: (key, value, ttl) => setAsync(key, ttl, JSON.stringify(value)),
     };     ```
     ````

2. **Ensure Cache Invalidation:**

   - When API key data changes (e.g., status updated), invalidate the cache entry.

   - In `apiKeyService.js`:
     ````javascript
     async function updateApiKeyStatus(apiKeyId, status) {
       await db.query('UPDATE api_keys SET status = $1 WHERE id = $2', [status, apiKeyId]);
       await client.del(`api_key:${apiKeyId}`);
     }     ```
     ````

### Step 5: Add Endpoint Access Control per API Key

1. **Define Structure of `endpoints_allowed` Field:**

   - Store as an array or JSON object, e.g., `["/api/v1/search-by-mail", "/api/v1/search-by-domain"]` or `["all"]`.

2. **Implement Access Control Logic in `authMiddleware.js`:**

   ````javascript
   const requestedEndpoint = req.path;
   const allowedEndpoints = req.apiKeyData.endpoints_allowed;

   const isAllowed = allowedEndpoints.includes('all') || allowedEndpoints.includes(requestedEndpoint);

   if (!isAllowed) {
     return res.status(403).json({ error: 'Access to this endpoint is not allowed' });
   }   ```

   ````

3. **Handle HTTP Methods (Optional):**

   - If permissions are per method, include method checks.

### Step 6: Implement Per-Key Rate Limiting

1. **Choose a Rate Limiting Strategy:**

   - Use Redis to store counters for each API key.

2. **Create `rateLimiter.js` Middleware:**

   ````javascript
   const rateLimit = require('express-rate-limit');
   const RedisStore = require('rate-limit-redis');
   const redisClient = require('../services/redisClient');

   const rateLimiter = (req, res, next) => {
     const rateLimitValue = req.apiKeyData.rate_limit || 1000; // Default rate limit

     return rateLimit({
       store: new RedisStore({
         client: redisClient,
         prefix: `rl:${req.apiKeyData.id}:`,
       }),
       max: rateLimitValue,
       windowMs: 60000, // 1 minute window
       message: 'Too many requests, please try again later.',
     })(req, res, next);
   };

   module.exports = rateLimiter;   ```

   ````

3. **Update `app.js` to Include Rate Limiter:**

   ````javascript
   const rateLimiter = require('./middlewares/rateLimiter');
   app.use(rateLimiter);   ```

   ````

4. **Ensure Rate Limits are Configurable per API Key:**

   - Rate limit values fetched from `req.apiKeyData.rate_limit`.

### Step 7: Implement Asynchronous Logging and Usage Tracking

1. **Create Logging Middleware `requestLogger.js`:**

   ````javascript
   const { logRequest } = require('../services/loggingService');

   const requestLogger = (req, res, next) => {
     const startTime = process.hrtime();

     res.on('finish', () => {
       const duration = process.hrtime(startTime);
       const responseTimeMs = (duration[0] * 1e3) + (duration[1] / 1e6);

       const logData = {
         apiKeyId: req.apiKeyData.id,
         timestamp: new Date(),
         endpoint: req.originalUrl,
         method: req.method,
         statusCode: res.statusCode,
         responseTimeMs,
         ipAddress: req.ip,
         userAgent: req.headers['user-agent'],
       };

       logRequest(logData);
     });

     next();
   };

   module.exports = requestLogger;   ```

   ````

2. **Implement Logging Service with Async Processing:**

   - **In `services/loggingService.js`:**

     ````javascript
     const db = require('../config/database');
     const logQueue = [];
     let isProcessing = false;

     async function processLogQueue() {
       if (isProcessing || logQueue.length === 0) return;

       isProcessing = true;
       const logsToInsert = logQueue.splice(0, logQueue.length);

       // Batch insert logs
       const queryText = 'INSERT INTO api_requests_log (...) VALUES ...';
       const values = []; // Prepare values from logsToInsert

       try {
         await db.query(queryText, values);

         // Update usage stats
         const usageUpdates = {}; // Map apiKeyId to request count
         logsToInsert.forEach(log => {
           usageUpdates[log.apiKeyId] = (usageUpdates[log.apiKeyId] || 0) + 1;
         });

         // Update usage stats in bulk
         const usageQueryText = 'UPDATE api_usage SET total_requests = total_requests + $1 WHERE api_key_id = $2';
         // Execute updates for each apiKeyId

       } catch (error) {
         console.error('Error processing log queue:', error);
       } finally {
         isProcessing = false;
       }
     }

     setInterval(processLogQueue, 5000); // Process every 5 seconds

     function logRequest(logData) {
       logQueue.push(logData);
     }

     module.exports = { logRequest };     ```
     ````

3. **Add `requestLogger` Middleware to `app.js`:**

   ````javascript
   const requestLogger = require('./middlewares/requestLogger');
   app.use(requestLogger);   ```

   ````

4. **Use a Job Queue for Scalability (Optional):**

   - For high-volume applications, consider using a message broker like RabbitMQ or a tool like Bull for Node.js.

### Step 8: Optimize Database Interactions and Algorithms

1. **Batch Database Operations:**

   - Batch insert logs and update usage stats to reduce the number of database transactions.

2. **Efficient Queries:**

   - Ensure all SQL queries are optimized.
   - Use prepared statements and parameterized queries.

3. **Indexing:**

   - Add indexes on frequently queried columns (e.g., `api_key_id`, `timestamp`).

4. **Use Connection Pooling:**

   - Ensure the database client uses connection pooling to manage connections efficiently.

5. **Monitor and Tune Performance:**

   - Use PostgreSQL tools to monitor query performance.
   - Analyze slow queries and optimize them.

### Step 9: Update Documentation and API Specifications

1. **Update `API Documentation.md`:**

   - Explain the new authentication mechanism.
   - Provide instructions on how clients can obtain API keys.
   - Document error messages and status codes related to authentication and rate limiting.

2. **Include Examples:**

   - Show examples of request headers with API keys.
   - Provide sample code snippets in different languages.

3. **Communicate Changes to Clients:**

   - Notify existing clients about the upcoming changes.
   - Provide migration support if necessary.

### Step 10: Testing and Validation

1. **Unit Tests:**

   - Write tests for new services and middlewares.
   - Test API key creation, authentication flows, and error handling.

2. **Integration Tests:**

   - Test end-to-end scenarios, including permission checks and rate limiting.

3. **Load Testing:**

   - Use tools like JMeter or k6 to simulate high traffic.
   - Ensure the system performs well under load.

4. **Security Testing:**

   - Check for vulnerabilities like API key leakage, injection attacks, or rate limit bypassing.

5. **User Acceptance Testing (UAT):**

   - Allow a group of users to test the new system before full rollout.

## 6. Deployment Strategy

1. **Staging Environment:**

   - Deploy changes to a staging environment identical to production.

2. **Data Migration:**

   - Since we're introducing new tables, ensure migrations are applied smoothly.

3. **Gradual Rollout:**

   - Implement feature flags or environment variables to control the activation of the new authentication system.
   - Allow dual operation of old and new systems during transition.

4. **Monitor Metrics:**

   - Keep an eye on performance, error rates, and logs after deployment.

## 7. Rollout and Monitoring

1. **Rollback Plan:**

   - Have a plan to revert to the previous authentication mechanism if critical issues arise.

2. **Monitoring:**

   - Set up dashboards to monitor:
     - API response times.
     - Authentication errors.
     - Rate limiting events.
     - Database performance.

3. **Alerts:**

   - Configure alerts for anomalies, such as spikes in errors or load.

## 8. Final Considerations

1. **Ensure Backward Compatibility:**

   - For existing clients, consider supporting old API keys for a grace period.

2. **Security Practices:**

   - Securely store API keys using hashing.
   - Use HTTPS for all communications.
   - Implement regular security audits.

3. **Performance Optimization:**

   - Continuously profile the application to identify bottlenecks.
   - Optimize code and infrastructure based on findings.

4. **Scalability:**

   - Ensure that the system can scale horizontally as the number of API keys and usage grows.

5. **Future Enhancements:**

   - Implement a client portal for API key management.
   - Introduce more granular permissions (e.g., per-method access).
   - Provide real-time usage dashboards for clients.

By following this detailed plan, engineers can incrementally implement the new authentication system while maintaining the current functionality of the APIs. Each step builds upon the previous, ensuring a smooth transition and minimizing risks associated with such an overhaul.

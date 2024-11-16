### API Key Management System Documentation

#### Overview

The API key management system implements a robust authentication and authorization mechanism using API keys. It includes features like rate limiting, usage tracking, endpoint access control, and comprehensive logging. The system uses PostgreSQL (via Supabase) for persistent storage and Redis for caching and rate limiting.

#### Core Components

##### 1. Database Schema (Supabase/PostgreSQL)

###### Tables

1. **api_keys**

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  endpoints_allowed TEXT[] DEFAULT ARRAY['all'],
  rate_limit INTEGER DEFAULT 1000,
  daily_limit INTEGER DEFAULT 50,
  monthly_limit INTEGER DEFAULT 150,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'revoked')),
  CONSTRAINT valid_timezone CHECK (timezone IS NOT NULL)
);
```

2. **api_usage**

```sql
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  total_requests BIGINT DEFAULT 0,
  daily_requests INTEGER DEFAULT 0,
  monthly_requests INTEGER DEFAULT 0,
  last_request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_requests CHECK (
    daily_requests >= 0 AND
    monthly_requests >= 0 AND
    total_requests >= 0
  )
);
```

3. **api_requests_log**

```sql
CREATE TABLE api_requests_log (
  id SERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  timestamp TIMESTAMP WITH TIME ZONE,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT
);
```

##### 2. Key Files and Their Roles

###### Authentication & Authorization

1. **middlewares/authMiddleware.js**

   - Validates API keys against database/cache
   - Checks endpoint access permissions using ALWAYS_ALLOWED_ENDPOINTS
   - Attaches API key data to request object
   - Handles error responses with proper logging

2. **services/apiKeyService.js**

   - Retrieves and validates API key details
   - Manages API key limits (daily, monthly)
   - Handles timezone-aware operations
   - Updates API key configurations

3. **utils/apiKeyUtils.js** 2. Generates cryptographically secure API keys 3. Updates API key details with validation 4. Manages endpoint permissions with ALWAYS_ALLOWED_ENDPOINTS inclusion 5. Handles metadata updates

###### Rate Limiting & Usage Tracking

1. **middlewares/rateLimiter.js**

   - Implements per-minute rate limiting using Redis
   - Uses express-rate-limit with Redis store
   - Configurable limits based on apiKeyData.rate_limit
   - Proper error handling with retry-after headers
   - Includes fallback mechanism for Redis failures (based on codebase recommendations)

2. **middlewares/complexRateLimitMiddleware.js**

   - Handles daily and monthly usage limits using PostgreSQL
   - Integrates with loggingService for usage tracking
   - Timezone-aware limit resets
   - Implements retry-after calculation based on limit type
   - Supports exempted endpoints (e.g., USAGE_ENDPOINT)

3. **services/loggingService.js** 2. Implements asynchronous batch logging with queue system 3. Queue processing every 5 seconds (as shown in codebase) 4. Transaction-safe bulk inserts for request logs 5. Handles usage statistics with timezone awareness 6. Implements automatic counter resets 7. Provides real-time usage statistics retrieval

###### Utilities

1. **utils/hashUtils.js**

   - Implements SHA-256 hashing for API keys
   - Provides consistent hashing across the application

2. **utils/cacheUtils.js** 2. Manages Redis caching for API keys 3. Handles cache invalidation with proper error handling 4. Implements cache key patterns

##### 3. Middleware Chain

The system implements a consistent middleware chain across all routes:

1. Request ID Assignment (requestIdMiddleware)

   - Generates unique UUID for each request
   - Attaches ID to req object for tracking

2. Authentication (authMiddleware)

   - Validates API key
   - Checks permissions
   - Attaches API key data to request

3. Rate Limiting (rateLimiter)

   - Per-minute rate limiting
   - Redis-based tracking

4. Complex Rate Limiting (complexRateLimitMiddleware)

   - Daily/monthly limits
   - Usage tracking integration

5. Request Logging (requestLogger)

   - Captures request start time
   - Logs complete request details
   - Tracks response time

6. Route-specific middlewares

   - Date normalization
   - Sorting
   - Other custom processing

7. Response Sending (sendResponseMiddleware) 2. Standardizes response format 3. Logs response completion

##### 4. Implementation Flow

###### API Key Generation and Management

```javascript
// In utils/apiKeyUtils.js
async function generateApiKey(
  userId,
  metadata,
  endpointsAllowed,
  rateLimit,
  dailyLimit,
  monthlyLimit,
  timezone
) {
  const apiKey = crypto.randomBytes(32).toString("hex");
  const hashedApiKey = hashApiKey(apiKey);
  // Ensure ALWAYS_ALLOWED_ENDPOINTS are included
  const sanitizedEndpoints = [
    ...new Set([...endpointsAllowed.map(String), ...ALWAYS_ALLOWED_ENDPOINTS]),
  ];
  const newApiKey = await ApiKey.create({
    user_id: userId,
    api_key: hashedApiKey,
    status: "active",
    metadata,
    endpoints_allowed: sanitizedEndpoints,
    rate_limit: rateLimit,
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
    timezone,
  });
  return { apiKey, apiKeyData: newApiKey };
}
```

###### Request Processing Flow

1. **Authentication**

```javascript
// In middlewares/authMiddleware.js
const apiKey = req.header("api-key");
const apiKeyData = await getApiKeyDetails(apiKey);
req.apiKeyData = apiKeyData;
```

2. **Rate Limiting**

```javascript
// In middlewares/rateLimiter.js
const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000,
  max: (req) => req.apiKeyData.rate_limit,
  keyGenerator: (req) => `rate-limit:${req.apiKeyData.id}`,
});
```

3. **Usage Tracking**

```javascript
// In services/loggingService.js
const logQueue = [];
let isProcessing = false;

async function processLogQueue() {
  if (isProcessing || logQueue.length === 0) return;
  isProcessing = true;

  const logsToInsert = logQueue.splice(0, logQueue.length);
  const transaction = await sequelize.transaction();

  try {
    await ApiRequestLog.bulkCreate(logsToInsert, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    logger.error("Error processing log queue:", error);
  } finally {
    isProcessing = false;
  }
}
```

##### 5. Error Handling

1. **Custom Error Classes**

   - UsageLimitExceededError for rate/usage limits
   - Specific error responses for different scenarios
   - Error logging with context using logger.error()
   - Transaction rollback handling for database operations

2. **Rate Limit Responses**

```javascript
res.status(429).json({
  error: "Rate limit exceeded",
  message: "Too many requests",
  retryAfter: calculateRetryAfter(limitType),
  limitType: "daily|monthly|rate", // Specific limit type that was exceeded
  currentUsage: usage.daily_requests || usage.monthly_requests,
  limit: apiKeyData.daily_limit || apiKeyData.monthly_limit,
});
```

##### 6. Security Measures

1. **API Key Storage**

   - Keys stored as SHA-256 hashes
   - Original keys never logged or stored
   - Secure key generation using crypto.randomBytes

2. **Access Control** 2. Granular endpoint permissions 3. Status checks (active/inactive/suspended) 4. Always allowed endpoints protection

##### 7. Performance Optimizations

1. **Caching Strategy**

   - API key validation results cached in Redis
   - LRU cache for domain sanitization (from domainUtils.js)
   - Cache invalidation on API key updates
   - Configurable TTL for cached items
   - Fallback mechanisms for cache failures

2. **Database Optimizations** 2. Connection pooling 3. Transaction management 4. Batch inserts for logs

##### 8. Monitoring and Logging

1. **Request Logging**

   - Asynchronous batch logging
   - Comprehensive request details
   - Performance metrics tracking

2. **Usage Statistics** 2. Real-time tracking 3. Timezone-aware reset scheduling 4. Transaction-safe updates

##### 9. Future Enhancements

1. **Planned Improvements**

   - Client portal for API key management
   - Real-time usage dashboards
   - Method-level access control
   - Enhanced monitoring

2. **Scalability Considerations** 2. Horizontal scaling support 3. Cache optimization 4. Database query optimization 5. Load balancing ready

##### Usage Reset Implementation

The system implements a dual-layer approach for usage reset:

1. **Real-time Reset Check** (Database Function)

```sql
-- In PostgreSQL function reset_and_update_usage
CREATE OR REPLACE FUNCTION reset_and_update_usage(p_api_key_id UUID)
RETURNS TABLE (
    updated_daily_requests INTEGER,
    updated_monthly_requests INTEGER,
    needs_daily_reset BOOLEAN,
    needs_monthly_reset BOOLEAN
) AS $$
-- Function checks if reset is needed during each request
-- Handles immediate resets when detected
```

2. **Scheduled Background Reset** (Node.js Cron Job)

```javascript
// In scheduledJobs.js
cron.schedule("0 * * * *", async () => {
  // Runs every hour
  // Resets counters for all API keys in each timezone
});
```

###### Reset Mechanism Integration

1. **Hourly Scheduled Reset**

   - `scheduledJobs.js` runs every hour to handle cases where:
   - No requests occurred during the reset period
   - System was temporarily down during reset time
   - Ensures consistency across all API keys

```javascript
async function resetUsageForTimezone(timezone) {
  const now = moment().tz(timezone);
  const isFirstOfMonth = now.date() === 1;

  await sequelize.transaction(async (t) => {
    // Reset daily usage
    await sequelize.query(
      `
      UPDATE api_usage au
      SET daily_requests = 0
      FROM api_keys ak
      WHERE au.api_key_id = ak.id
        AND ak.timezone = :timezone
        AND au.last_request_date < :currentDate
    `,
      {
        replacements: { timezone, currentDate: now.format("YYYY-MM-DD") },
        transaction: t,
      }
    );

    // Reset monthly usage if it's first of month
    if (isFirstOfMonth) {
      // Monthly reset query
    }
  });
}
```

2. **Request-time Reset** 2. Handled by `loggingService.js` during request processing 3. Provides immediate reset when needed 4. Ensures accurate limit enforcement

###### Reset Coordination

The system coordinates resets through:

1. **Timezone Awareness**

   - Each API key has its own timezone
   - Resets occur at midnight in the API key's timezone
   - Scheduled job processes each timezone separately

2. **Transaction Safety**

   - Both scheduled and real-time resets use transactions
   - Prevents partial updates
   - Maintains data consistency

3. **Last Request Date Tracking**

   - `last_request_date` in api_usage table
   - Used by both reset mechanisms
   - Ensures accurate reset timing

4. **Reset Verification**

```javascript
// In scheduledJobs.js
try {
  // Get all unique timezones
  const [timezones] = await sequelize.query(
    "SELECT DISTINCT timezone FROM api_keys"
  );

  // Process each timezone
  for (const { timezone } of timezones) {
    await resetUsageForTimezone(timezone);
  }
} catch (error) {
  logger.error("Error in scheduled usage reset:", error);
}
```

###### Benefits of Dual-Layer Reset

1. **Reliability**

   - Scheduled job ensures resets occur even without requests
   - Real-time check provides immediate reset when needed

2. **Consistency**

   - Both mechanisms use the same timezone-aware logic
   - Transactions ensure atomic updates

3. **Performance**

   - Scheduled job handles bulk resets efficiently
   - Real-time check only processes active API keys

4. **Error Recovery** 2. Scheduled job can catch up after system downtime 3. Logging helps track reset operations

This dual-layer approach ensures robust and reliable usage reset handling while maintaining system performance and data consistency.

This implementation provides a robust, secure, and scalable API key management system with comprehensive features for authentication, authorization, rate limiting, and usage tracking. The system is designed with clear separation of concerns and follows best practices for security and performance.

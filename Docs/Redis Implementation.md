### Redis Usage Documentation

#### Introduction

Redis is implemented in this codebase primarily for caching and rate limiting purposes. It provides fast, in-memory data storage that helps improve the application's performance and scalability. Redis is particularly useful for storing temporary data like API key validation results and managing rate limiting counters.

#### 1. How is Redis Implemented in This Codebase?

Redis is implemented using the `redis` npm package. The Redis client is configured and initialized in the `redisClient.js` file. This client is then used in various middlewares and services to store and retrieve data.

##### Redis Data Structures Used

- **Strings**: Used for caching API key validation results.
- **Sorted Sets**: Used for implementing a sliding window rate limiting algorithm.

#### 2. What Structure Does It Follow?

The Redis implementation follows a modular structure where the Redis client and its asynchronous methods are encapsulated in a separate module. This module is then imported and used in other parts of the application as needed.

##### File Structure:

- `redisClient.js`: Initializes and exports the Redis client and asynchronous methods.
- `complexRateLimitMiddleware.js`: Uses Redis for rate limiting.
- `authMiddleware.js`: Uses Redis for caching API key validation results.

#### 3. Guidelines for Using Redis for New Features

When adding new features that require Redis, follow these guidelines:

1. **Encapsulation**: Always encapsulate Redis operations in a separate module or service.
2. **Error Handling**: Ensure proper error handling when interacting with Redis.
3. **Namespace Keys**: Use a consistent naming convention for Redis keys to avoid collisions.
4. **TTL (Time to Live)**: Set appropriate TTL values for cached data.
5. **Asynchronous Operations**: Use asynchronous methods for Redis operations.
6. **Choose Appropriate Data Structures**: Select the most suitable Redis data structure for your use case.
7. **Bulk Operations**: When implementing bulk operations like the new bulk search functionality, consider using Redis for caching frequently requested data or storing intermediate results to improve performance.

#### 4. Implementation Details and Code Snippets

##### Redis Client Initialization

```js
const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

const asyncRedis = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  setex: promisify(client.setex).bind(client),
  del: promisify(client.del).bind(client),
  incr: promisify(client.incr).bind(client),
  expire: promisify(client.expire).bind(client),
};

module.exports = { client, asyncRedis };
```

##### Rate Limiting Middleware

The `complexRateLimitMiddleware` uses Redis sorted sets to implement a sliding window rate limiting algorithm:

```js
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
```

##### API Key Validation Middleware

The `authMiddleware` uses Redis to cache API key validation results:

```js
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
```

#### 5. Redis Connection Management

The Redis client is created in `redisClient.js`. It's important to handle connection errors and implement reconnection strategies:

```js
client.on("error", (error) => {
  console.error("Redis connection error:", error);
});

client.on("ready", () => {
  console.log("Redis connection established");
});
```

Consider implementing a more robust reconnection strategy for production environments, such as:

```js
const MAX_RETRIES = 10;
let retryAttempts = 0;

client.on("error", (error) => {
  console.error("Redis connection error:", error);
  if (retryAttempts < MAX_RETRIES) {
    retryAttempts++;
    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${retryAttempts}/${MAX_RETRIES})...`
      );
      client.retry_strategy = () => 1000; // Retry after 1 second
    }, 1000 * retryAttempts);
  } else {
    console.error("Max retry attempts reached. Unable to connect to Redis.");
    process.exit(1);
  }
});

client.on("ready", () => {
  console.log("Redis connection established");
  retryAttempts = 0;
});
```

#### 6. Monitoring and Maintenance

- Use Redis CLI commands like `INFO` and `MONITOR` to check Redis server status and monitor real-time operations.
- Implement proper logging for Redis operations to track usage and diagnose issues.
- Regularly check Redis memory usage and consider implementing a memory limit to prevent out-of-memory errors.
- Implement a backup strategy for Redis data if persistence is required.

Example of monitoring Redis memory usage:

```js
const checkRedisMemory = async () => {
  const info = await asyncRedis.info("memory");
  const usedMemory = parseInt(info.match(/used_memory:(\d+)/)[1]);
  const maxMemory = 1024 * 1024 * 1024; // 1GB

  if (usedMemory > maxMemory * 0.8) {
    logger.warn(`Redis memory usage is high: ${usedMemory} bytes`);
  }
};

setInterval(checkRedisMemory, 60000); // Check every minute
```

#### 7. Environment Configuration

Ensure that the Redis connection details are correctly set in the `.env` file:

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS=true
```

Adjust the `redisClient.js` file to use these additional configuration options when creating the Redis client:

```js
const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
});
```

By following these guidelines and examples, new engineers can effectively use Redis in this codebase for caching, rate limiting, and other purposes while maintaining best practices for performance and reliability.

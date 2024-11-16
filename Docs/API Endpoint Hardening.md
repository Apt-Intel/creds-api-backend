### API Endpoint Hardening Guide

A comprehensive guide based on current implementation patterns for securing API endpoints.

#### Table of Contents

1. [Architecture Overview](#architecture-overview "Architecture Overview")
2. [Security Middleware Chain](#security-middleware-chain "Security Middleware Chain")
3. [MongoDB Endpoint Hardening](#mongodb-endpoint-hardening "MongoDB Endpoint Hardening")
4. [API Key Management Hardening](#api-key-management-hardening "API Key Management Hardening")
5. [Implementation Examples](#implementation-examples)
6. [Best Practices & Standards](#best-practices--standards "Best Practices & Standards")

#### Architecture Overview

##### Database Structure

```javascript
// MongoDB: Log data storage
const logSchema = {
  "Log date": Date,
  Date: Date,
  Credentials: Array,
  Emails: Array,
  Employee: String,
  // ... other fields
};

// PostgreSQL: API key management
const apiKeySchema = {
  id: "UUID",
  user_id: "String",
  api_key: "String",
  status: "String",
  endpoints_allowed: "Array",
  rate_limit: "Integer",
  // ... other fields
};
```

#### Security Middleware Chain

##### Core Security Middleware Setup

```javascript:app.js
// Required middleware imports
const authMiddleware = require('./middlewares/authMiddleware');
const rateLimitMiddleware = require('./middlewares/rateLimitMiddleware');
const complexRateLimitMiddleware = require('./middlewares/complexRateLimitMiddleware');
const documentRedesignMiddleware = require('./middlewares/documentRedesignMiddleware');

// Middleware chain setup
app.use(express.json());
app.use(requestIdMiddleware);
app.use(authMiddleware);
app.use(rateLimitMiddleware);
app.use(complexRateLimitMiddleware);
app.use(requestLogger);

// Route-specific middleware
app.use('/v1', v1Router);
app.use('/internal', internalRouter);
app.use('/admin', adminRouter);
```

#### MongoDB Endpoint Hardening

##### 1. Controller Implementation Pattern

```javascript:controllers/v1/mailController.js
const searchByMail = async (req, res, next) => {
  const mail = req.body.mail || req.query.mail;
  const page = parseInt(req.query.page, 10);
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Search initiated`, {
    mail,
    page,
    type,
    sortby,
    sortorder,
    requestId: req.requestId
  });

  // Input validation
  if (!mail || !validator.isEmail(mail)) {
    logger.warn(`Invalid email format`, { mail, requestId: req.requestId });
    return res.status(400).json({ error: "Valid mail parameter is required" });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection("logs");

    // Query construction
    const query = type === "all"
      ? { Emails: sanitizedMail }
      : { Employee: sanitizedMail };

    // Pagination
    const { limit, skip } = getPaginationParams(page);

    // Execute query with proper sorting
    const [results, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sortby]: sortorder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);

    req.searchResults = {
      total,
      page,
      results
    };

    next();
  } catch (error) {
    logger.error(`Error in searchByMail`, {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId
    });
    next(error);
  }
};
```

##### 2. Document Redesign Implementation

```javascript:middlewares/documentRedesignMiddleware.js
const documentRedesignMiddleware = async (req, res, next) => {
  try {
    const searchedEmail = req.body.mail || req.query.mail;
    const results = req.searchResults.results;

    const processedResults = await Promise.all(
      results.map(async (doc) => {
        // Credential categorization
        const categorizedDoc = await redesignDocument(doc, searchedEmail);
        return {
          ...categorizedDoc,
          InternalCredentials: [],
          ExternalCredentials: [],
          OtherCredentials: []
        };
      })
    );

    req.searchResults.results = processedResults;
    next();
  } catch (error) {
    logger.error("Document redesign error:", {
      error: error.message,
      requestId: req.requestId
    });
    next(error);
  }
};
```

##### 3. Date Normalization

```javascript:middlewares/dateNormalizationMiddleware.js
const dateNormalizationMiddleware = (req, res, next) => {
  try {
    const results = req.searchResults.results;

    const normalizedResults = results.map(doc => ({
      ...doc,
      "Log date": new Date(doc["Log date"]),
      "Date": new Date(doc["Date"])
    }));

    req.searchResults.results = normalizedResults;
    next();
  } catch (error) {
    logger.error("Date normalization error:", {
      error: error.message,
      requestId: req.requestId
    });
    next(error);
  }
};
```

#### API Key Management Hardening

##### 1. Authentication Middleware

```javascript:middlewares/authMiddleware.js
const authMiddleware = async (req, res, next) => {
  const apiKey = req.header("api-key");

  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    // Redis cache check
    const cachedKey = await redisClient.get(`api_key:${apiKey}`);
    if (cachedKey) {
      req.apiKeyData = JSON.parse(cachedKey);
      return next();
    }

    // Database validation
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      logger.warn("Invalid API key attempt", { apiKey });
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Cache valid key
    await redisClient.setex(
      `api_key:${apiKey}`,
      3600,
      JSON.stringify(keyData)
    );

    req.apiKeyData = keyData;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", {
      error: error.message,
      requestId: req.requestId
    });
    next(error);
  }
};
```

##### 2. Rate Limiting Implementation

```javascript:middlewares/rateLimitMiddleware.js
const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => req.apiKeyData.rate_limit,
  keyGenerator: (req) => `rate-limit:${req.apiKeyData.id}`,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded`, {
      apiKeyId: req.apiKeyData.id,
      requestId: req.requestId
    });
    res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: calculateRetryAfter(req)
    });
  }
});
```

##### 3. Complex Rate Limiting

```javascript:middlewares/complexRateLimitMiddleware.js
const complexRateLimitMiddleware = async (req, res, next) => {
  const { apiKeyData } = req;

  try {
    const usage = await getApiKeyUsage(apiKeyData.id);

    // Check daily limit
    if (usage.daily_requests >= apiKeyData.daily_limit) {
      return res.status(429).json({
        error: "Daily limit exceeded",
        retryAfter: calculateDailyRetryAfter(apiKeyData.timezone)
      });
    }

    // Check monthly limit
    if (usage.monthly_requests >= apiKeyData.monthly_limit) {
      return res.status(429).json({
        error: "Monthly limit exceeded",
        retryAfter: calculateMonthlyRetryAfter(apiKeyData.timezone)
      });
    }

    next();
  } catch (error) {
    logger.error("Complex rate limit error:", {
      error: error.message,
      requestId: req.requestId
    });
    next(error);
  }
};
```

#### Best Practices & Standards

##### 1. Error Response Format

```javascript
const standardErrorResponse = (error, req) => ({
  error: error.type || "Internal Server Error",
  message: error.message,
  requestId: req.requestId,
  details: process.env.NODE_ENV === "production" ? undefined : error.stack,
});
```

##### 2. Logging Standards

```javascript
// Request logging
logger.info(`API Request`, {
  method: req.method,
  path: req.path,
  requestId: req.requestId,
  apiKeyId: req.apiKeyData?.id,
  query: req.query,
  body: sanitizeLogData(req.body),
});

// Error logging
logger.error(`API Error`, {
  error: error.message,
  stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  requestId: req.requestId,
  apiKeyId: req.apiKeyData?.id,
});
```

##### 3. Input Validation Utilities

```javascript:utils/validation.js
const validateSearchParams = (params) => {
  const errors = [];

  if (!params.mail && !params.domain) {
    errors.push("Either mail or domain parameter is required");
  }

  if (params.mail && !validator.isEmail(params.mail)) {
    errors.push("Invalid email format");
  }

  if (params.page && (!Number.isInteger(params.page) || params.page < 1)) {
    errors.push("Page must be a positive integer");
  }

  return errors;
};
```

#### Implementation Checklist for New Endpoints

##### MongoDB Endpoints

- [ ] Input validation
- [ ] Query safety
- [ ] Pagination
- [ ] Document redesign
- [ ] Date normalization
- [ ] Error handling
- [ ] Logging

##### API Key Management Endpoints

- [ ] Authentication
- [ ] Rate limiting
- [ ] Cache implementation
- [ ] Transaction safety
- [ ] Audit logging
- [ ] Error handling

const rateLimit = require("express-rate-limit");
const Redis = require("ioredis");
const { RedisStore } = require("rate-limit-redis");
const logger = require("../config/logger");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    return req.apiKeyData.rate_limit || 1000; // Default to 1000 if not set
  },
  keyGenerator: (req) => {
    return `rate-limit:${req.apiKeyData.id}`;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for API key: ${req.apiKeyData.id}`);
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many requests, please try again later.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

module.exports = rateLimiter;

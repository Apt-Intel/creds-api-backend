const rateLimit = require("express-rate-limit");

const rateLimitMiddleware = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 50, // limit each API key to 50 requests per windowMs
  message: "Too many requests, please try again after 10 seconds",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.header("api-key"), // Use API key for rate limiting
  skip: (req) => !req.header("api-key"), // Skip rate limiting if no API key (will be caught by auth middleware)
});

module.exports = rateLimitMiddleware;

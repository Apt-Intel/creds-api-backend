const redis = require("redis");
const { promisify } = require("util");
const logger = require("./logger");

const REDIS_URL = process.env.REDIS_URL;

const redisClient = redis.createClient(REDIS_URL);

redisClient.on("error", (error) => {
  logger.error("Redis error:", error);
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("ready", () => {
  logger.info("Redis is ready");
  redisClient.flushall((err, succeeded) => {
    if (succeeded) {
      logger.info("Redis cache cleared");
    } else {
      logger.error("Failed to clear Redis cache:", err);
    }
  });
});

// Promisify Redis methods
const asyncRedis = {
  get: promisify(redisClient.get).bind(redisClient),
  set: promisify(redisClient.set).bind(redisClient),
  del: promisify(redisClient.del).bind(redisClient),
  incr: promisify(redisClient.incr).bind(redisClient),
  expire: promisify(redisClient.expire).bind(redisClient),
  flushall: promisify(redisClient.flushall).bind(redisClient),
  setex: promisify(redisClient.setex).bind(redisClient),
};

module.exports = { redisClient, asyncRedis };

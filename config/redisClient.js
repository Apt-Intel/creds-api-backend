const redis = require("redis");
const { promisify } = require("util");
const logger = require("./logger");

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (error) => {
  logger.error("Redis client error:", error);
});

client.on("connect", () => {
  logger.info("Redis client connected");
});

const asyncRedis = {
  get: promisify(client.get).bind(client),
  setex: promisify(client.setex).bind(client),
  del: promisify(client.del).bind(client),
};

module.exports = { client, asyncRedis };

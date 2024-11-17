const redis = require("redis");
const logger = require("./logger");

const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: function (options) {
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      logger.error("The server refused the connection");
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      logger.error("Retry time exhausted");
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
});

client.on("connect", () => {
  logger.info("Redis client connected");
});

client.on("ready", () => {
  logger.info("Redis client ready");
});

client.on("error", (err) => {
  logger.error("Redis client error:", err);
});

client.on("reconnecting", () => {
  logger.warn("Redis client reconnecting...");
});

client.on("end", () => {
  logger.warn("Redis client disconnected");
});

// Export both the client and promisified methods
module.exports = {
  client,
  // Add any additional Redis commands you need to use
  async get(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply);
      });
    });
  },
  async set(key, value, expiry = null) {
    return new Promise((resolve, reject) => {
      if (expiry) {
        client.setex(key, expiry, value, (err, reply) => {
          if (err) reject(err);
          resolve(reply);
        });
      } else {
        client.set(key, value, (err, reply) => {
          if (err) reject(err);
          resolve(reply);
        });
      }
    });
  },
  async del(key) {
    return new Promise((resolve, reject) => {
      client.del(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply);
      });
    });
  },
};

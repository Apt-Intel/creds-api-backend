const { parseDate } = require("../services/dateService");
const logger = require("../config/logger");

const dateNormalizationMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = async function (data) {
    try {
      if (Array.isArray(data)) {
        data = await Promise.all(data.map(normalizeLogDate));
      } else if (typeof data === "object" && data !== null) {
        data = await normalizeLogDate(data);
      }

      return originalJson.call(this, data);
    } catch (error) {
      logger.error("Error in date normalization middleware:", error);
      return originalJson.call(this, { error: "Internal server error" });
    }
  };

  next();
};

async function normalizeLogDate(obj) {
  if (obj["Log date"]) {
    try {
      obj["Log date"] = await parseDate(obj["Log date"]);
    } catch (error) {
      logger.error(`Error parsing Log date: ${obj["Log date"]}`, error);
    }
  }
  return obj;
}

module.exports = dateNormalizationMiddleware;

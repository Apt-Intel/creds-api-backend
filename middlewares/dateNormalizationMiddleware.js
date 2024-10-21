const { parseDate } = require("../services/dateService");
const logger = require("../config/logger");

function dateNormalizationMiddleware(req, res, next) {
  const originalJson = res.json;

  res.json = function (data) {
    if (Array.isArray(data)) {
      data = data.map(normalizeDate);
    } else if (typeof data === "object" && data !== null) {
      data = normalizeDate(data);
    }

    return originalJson.call(this, data);
  };

  next();
}

function normalizeDate(obj) {
  if (obj.Date) {
    try {
      obj.Date = parseDate(obj.Date);
    } catch (error) {
      logger.error(`Error parsing date: ${obj.Date}`, error);
    }
  }
  return obj;
}

module.exports = dateNormalizationMiddleware;

const logger = require("../config/logger");

const apiKeyDataMiddleware = (req, res, next) => {
  if (!req.apiKeyData || !req.apiKeyData.id) {
    logger.error("Missing API key data", {
      requestId: req.requestId,
      path: req.path,
    });
    return res
      .status(500)
      .json({ error: "API key data not properly initialized" });
  }
  next();
};

module.exports = apiKeyDataMiddleware;

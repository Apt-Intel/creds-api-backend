const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const validator = require("validator");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createPaginatedResponse } = require("../../utils/responseUtils");

async function internalSearchByLogin(req, res, next) {
  const login = req.body.login || req.query.login;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Internal login search initiated`, {
    login,
    page,
    pageSize,
    sortby,
    sortorder,
    requestId: req.requestId,
  });

  try {
    // Validate login parameter
    if (!login) {
      logger.warn("Missing login parameter");
      return res.status(400).json({ error: "Login parameter is required" });
    }

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      logger.warn("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
      return res.status(400).json({ errors: paginationValidation.errors });
    }

    // Sanitize login parameter
    const sanitizedLogin = validator.escape(login);

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query = { Usernames: sanitizedLogin };
    const { limit, skip } = getPaginationParams(page, pageSize);

    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    const response = createPaginatedResponse({
      total,
      page,
      pageSize: limit,
      results,
      metadata: {
        sort: {
          field: sortby,
          order: sortorder,
        },
      },
    });

    logger.info(`Internal login search completed`, {
      login: sanitizedLogin,
      total,
      requestId: req.requestId,
    });

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in internalSearchByLogin:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    next(error);
  }
}

module.exports = {
  internalSearchByLogin,
};

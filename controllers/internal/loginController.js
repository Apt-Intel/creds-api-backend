const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createStandardResponse } = require("../../utils/responseUtils");
const { errorUtils } = require("../../utils/errorUtils");
const { performance } = require("perf_hooks");

async function internalSearchByLogin(req, res, next) {
  const startTime = performance.now();
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
      throw errorUtils.validationError("Login parameter is required");
    }

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      throw errorUtils.validationError("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
    }

    // Validate sort parameters
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      throw errorUtils.validationError("Invalid sortby parameter", {
        parameter: "sortby",
        received: sortby,
        allowed: validSortBy,
      });
    }

    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      throw errorUtils.validationError("Invalid sortorder parameter", {
        parameter: "sortorder",
        received: sortorder,
        allowed: validSortOrder,
      });
    }

    const db = await getDatabase();
    if (!db) {
      throw errorUtils.serverError("Database connection not established");
    }

    const collection = db.collection("logs");
    const { limit, skip } = getPaginationParams(page, pageSize);

    const query = { "Credentials.Username": login };

    const sortField = sortby === "date_uploaded" ? "Date" : "Date Compromised";
    const sortDirection = sortorder === "desc" ? -1 : 1;

    const [results, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    // Set searchResults on req object for middleware processing
    req.searchResults = {
      meta: {
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
      total,
      page,
      pageSize,
      data: results, // Raw data at the bottom
    };

    logger.info("Internal login search completed", {
      login,
      total,
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  internalSearchByLogin,
};

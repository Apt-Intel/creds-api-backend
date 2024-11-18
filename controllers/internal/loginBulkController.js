const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const { performance } = require("perf_hooks");
const validator = require("validator");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createBulkPaginatedResponse } = require("../../utils/responseUtils");

async function internalSearchByLoginBulk(req, res, next) {
  const startTime = performance.now();
  const { logins } = req.body;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Internal bulk login search initiated`, {
    loginCount: logins?.length,
    page,
    pageSize,
    sortby,
    sortorder,
    requestId: req.requestId,
  });

  try {
    // Validate logins array
    if (!Array.isArray(logins) || logins.length === 0 || logins.length > 10) {
      logger.warn("Invalid logins array", { loginCount: logins?.length });
      return res.status(400).json({
        error: "Invalid logins array. Must contain 1-10 usernames.",
      });
    }

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      logger.warn("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
      return res.status(400).json({ errors: paginationValidation.errors });
    }

    const sanitizedLogins = logins.map((login) => validator.escape(login));

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const { limit, skip } = getPaginationParams(page, pageSize);

    const searchPromises = sanitizedLogins.map(async (login) => {
      const query = { Usernames: login };

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        login,
        total,
        data: results,
      };
    });

    const searchResults = await Promise.all(searchPromises);
    const totalResults = searchResults.reduce(
      (sum, result) => sum + result.total,
      0
    );

    const response = createBulkPaginatedResponse({
      totalResults,
      page,
      pageSize: limit,
      results: searchResults,
      metadata: {
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
    });

    logger.info(`Internal bulk login search completed`, {
      loginCount: logins.length,
      totalResults,
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      requestId: req.requestId,
    });

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in internalSearchByLoginBulk:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    next(error);
  }
}

module.exports = {
  internalSearchByLoginBulk,
};

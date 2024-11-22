const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const {
  createStandardResponse,
  createBulkItemResponse,
} = require("../../utils/responseUtils");
const errorUtils = require("../../utils/errorUtils");
const { performance } = require("perf_hooks");

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
      throw errorUtils.validationError(
        "Invalid logins array. Must contain 1-10 logins.",
        {
          received: logins?.length,
        }
      );
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

    // Process each login with individual pagination
    const searchPromises = logins.map(async (login) => {
      const query = { "Credentials.Username": login };

      const sortField =
        sortby === "date_uploaded" ? "Date" : "Date Compromised";
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

      return createBulkItemResponse({
        identifier: login,
        total,
        page,
        pageSize,
        results,
      });
    });

    const searchResults = await Promise.all(searchPromises);
    const totalResults = searchResults.reduce(
      (sum, result) => sum + result.pagination.total_items,
      0
    );

    // Set searchResults on req object for middleware processing
    req.searchResults = {
      meta: {
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
      search_counts: Object.fromEntries(
        searchResults.map((result) => [
          result.login,
          result.pagination.total_items,
        ])
      ),
      total: totalResults,
      page,
      pageSize,
      data: searchResults,
    };

    logger.info("Internal bulk login search completed", {
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      totalResults,
      loginCount: logins.length,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  internalSearchByLoginBulk,
};

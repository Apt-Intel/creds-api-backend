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
const { sanitizeDomain } = require("../../utils/domainUtils");
const { performance } = require("perf_hooks");

async function internalSearchByDomainBulk(req, res, next) {
  const startTime = performance.now();
  const { domains } = req.body;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Internal bulk domain search initiated`, {
    domainCount: domains?.length,
    page,
    pageSize,
    sortby,
    sortorder,
    requestId: req.requestId,
  });

  try {
    // Validate domains array
    if (
      !Array.isArray(domains) ||
      domains.length === 0 ||
      domains.length > 10
    ) {
      throw errorUtils.validationError(
        "Invalid domains array. Must contain 1-10 domains.",
        {
          received: domains?.length,
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

    // Process each domain with individual pagination
    const searchPromises = domains.map(async (domain) => {
      const sanitizedDomain = await sanitizeDomain(domain);
      if (!sanitizedDomain) {
        logger.warn(`Invalid domain format skipped: ${domain}`);
        return {
          domain,
          pagination: {
            total_items: 0,
            total_pages: 0,
            current_page: page,
            page_size: pageSize,
            has_next_page: false,
            has_previous_page: false,
            next_page: null,
            previous_page: null,
          },
          data: [],
          error: "Invalid domain format",
        };
      }

      const query = { "Credentials.URL": new RegExp(sanitizedDomain, "i") };

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return createBulkItemResponse({
        identifier: sanitizedDomain,
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
          result.domain,
          result.pagination.total_items,
        ])
      ),
      total: totalResults,
      page,
      pageSize,
      data: searchResults,
    };

    logger.info("Internal bulk domain search completed", {
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      totalResults,
      domainCount: domains.length,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  internalSearchByDomainBulk,
};

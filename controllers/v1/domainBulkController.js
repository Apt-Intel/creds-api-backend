const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");
const { performance } = require("perf_hooks");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createBulkPaginatedResponse } = require("../../utils/responseUtils");

async function searchByDomainBulk(req, res, next) {
  const startTime = performance.now();
  const { domains } = req.body;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Bulk domain search initiated`, {
    domainCount: domains?.length,
    page,
    pageSize,
    type,
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
      logger.warn("Invalid domains array", { domainCount: domains?.length });
      return res.status(400).json({
        error: "Invalid domains array. Must contain 1-10 domains.",
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

    const sanitizedDomains = await Promise.all(
      domains.map((domain) => sanitizeDomain(domain))
    );

    const invalidDomains = sanitizedDomains.filter((domain) => !domain);
    if (invalidDomains.length > 0) {
      logger.warn("Invalid domain formats detected", {
        invalidCount: invalidDomains.length,
      });
      return res.status(400).json({
        error: "Invalid domain formats detected",
        invalidCount: invalidDomains.length,
      });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const { limit, skip } = getPaginationParams(page, pageSize);

    const searchPromises = sanitizedDomains.map(async (domain) => {
      const query = { Domains: domain };

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        domain,
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
        query_type: type,
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
    });

    logger.info(`Bulk domain search completed`, {
      domainCount: domains.length,
      totalResults,
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      requestId: req.requestId,
    });

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByDomainBulk:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    next(error);
  }
}

module.exports = {
  searchByDomainBulk,
};

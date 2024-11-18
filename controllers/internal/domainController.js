const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createPaginatedResponse } = require("../../utils/responseUtils");

async function internalSearchByDomain(req, res, next) {
  const domain = req.body.domain || req.query.domain;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Internal domain search initiated`, {
    domain,
    page,
    pageSize,
    sortby,
    sortorder,
    requestId: req.requestId,
  });

  try {
    // Validate domain
    if (!domain) {
      logger.warn("Missing domain parameter");
      return res.status(400).json({ error: "Domain parameter is required" });
    }

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      logger.warn("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
      return res.status(400).json({ errors: paginationValidation.errors });
    }

    const sanitizedDomain = await sanitizeDomain(domain);
    if (!sanitizedDomain) {
      logger.warn(`Invalid domain format: ${domain}`);
      return res.status(400).json({ error: "Invalid domain format" });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query = { Domains: sanitizedDomain };
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

    logger.info(`Internal domain search completed`, {
      domain: sanitizedDomain,
      total,
      requestId: req.requestId,
    });

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in internalSearchByDomain:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    next(error);
  }
}

module.exports = {
  internalSearchByDomain,
};

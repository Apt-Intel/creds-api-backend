const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");
const validator = require("validator");

async function searchByDomain(req, res, next) {
  const domain = req.body.domain || req.query.domain;
  const page = parseInt(req.query.page, 10);
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Search initiated for domain: ${domain}, page: ${page}, installed_software: ${installedSoftware}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  try {
    // Validate 'domain' parameter
    if (!domain) {
      logger.warn("Missing domain parameter");
      return res.status(400).json({ error: "Domain parameter is required" });
    }

    // Validate 'page' parameter
    if (isNaN(page) || page < 1) {
      logger.warn(`Invalid page parameter: ${req.query.page}`);
      return res.status(400).json({ error: "Invalid 'page' parameter" });
    }

    // Validate 'type' parameter
    const validTypes = ["strict", "all"];
    if (!validTypes.includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return res.status(400).json({ error: "Invalid 'type' parameter" });
    }

    // Validate 'sortby' parameter
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      logger.warn(`Invalid sortby parameter: ${sortby}`);
      return res.status(400).json({ error: "Invalid 'sortby' parameter" });
    }

    // Validate 'sortorder' parameter
    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      logger.warn(`Invalid sortorder parameter: ${sortorder}`);
      return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
    }

    const sanitizedDomain = await sanitizeDomain(domain);
    if (!sanitizedDomain) {
      logger.warn(`Invalid domain provided: ${domain}`);
      return res.status(400).json({ error: "Invalid domain provided" });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    // Use parameterized query with sanitized input
    const query = {
      [type === "all" ? "Emails" : "Employee"]: {
        $regex: `@${sanitizedDomain}$`,
        $options: "i",
      },
    };
    const { limit, skip } = getPaginationParams(page);

    // TODO: Implement projection to limit returned fields
    // This will optimize query performance and reduce data transfer
    // Example: const projection = { _id: 0, Emails: 1, Employee: 1, "Log date": 1, Date: 1 };
    // Discuss with the product team to determine which fields are necessary

    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    const response = {
      total,
      page,
      results,
    };

    logger.info(
      `Search completed for domain: ${sanitizedDomain}, total results: ${total}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByDomain:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

module.exports = {
  searchByDomain,
};

const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");
const { performance } = require("perf_hooks");
const validator = require("validator");

async function searchByDomainBulk(req, res, next) {
  const startTime = performance.now();
  const { domains } = req.body;
  const page = parseInt(req.query.page, 10);
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";
  const route = req.baseUrl + req.path;

  logger.info(
    `Bulk search request received for ${domains?.length} domains, page: ${page}, installed_software: ${installedSoftware}, sortby: ${sortby}, sortorder: ${sortorder}, route: ${route}`
  );

  try {
    // Validate 'domains' parameter
    if (
      !Array.isArray(domains) ||
      domains.length === 0 ||
      domains.length > 10
    ) {
      logger.warn(
        `Invalid input: domains array, count: ${domains?.length}, route: ${route}`
      );
      return res.status(400).json({
        error: "Invalid domains array. Must contain 1-10 domains.",
      });
    }

    // Validate 'page' parameter
    if (isNaN(page) || page < 1) {
      logger.warn(`Invalid page parameter: ${req.query.page}, route: ${route}`);
      return res.status(400).json({ error: "Invalid 'page' parameter" });
    }

    // Validate 'sortby' parameter
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (sortby && !validSortBy.includes(sortby)) {
      logger.warn(`Invalid sortby parameter: ${sortby}, route: ${route}`);
      return res.status(400).json({ error: "Invalid 'sortby' parameter" });
    }

    // Validate 'sortorder' parameter
    const validSortOrder = ["asc", "desc"];
    if (sortorder && !validSortOrder.includes(sortorder)) {
      logger.warn(`Invalid sortorder parameter: ${sortorder}, route: ${route}`);
      return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = domains.map(async (rawDomain) => {
      const domain = await sanitizeDomain(rawDomain);
      if (!domain) {
        logger.warn(
          `Invalid domain after sanitization: ${rawDomain}, route: ${route}`
        );
        return { domain: rawDomain, error: "Invalid domain" };
      }

      // Use parameterized query with sanitized input
      const query = { Domains: domain };
      const { limit, skip } = getPaginationParams(page);

      // TODO: Implement projection to limit returned fields
      // This will optimize query performance and reduce data transfer
      // Example: const projection = { _id: 0, Domains: 1, "Log date": 1, Date: 1 };
      // Discuss with the product team to determine which fields are necessary

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
      (sum, result) => sum + (result.total || 0),
      0
    );
    const response = {
      total: totalResults,
      page,
      results: searchResults,
    };

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    logger.info(
      `Bulk search completed for ${
        domains.length
      } domains, total results: ${totalResults}, processing time: ${totalTime.toFixed(
        2
      )}ms, route: ${route}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error(`Error in searchByDomainBulk: ${error}, route: ${route}`);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

module.exports = {
  searchByDomainBulk,
};

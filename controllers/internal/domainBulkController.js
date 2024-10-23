const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");
const { performance } = require("perf_hooks");

async function searchByDomainBulk(req, res, next) {
  const startTime = performance.now();
  const { domains } = req.body;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const route = req.baseUrl + req.path;

  logger.info(
    `Bulk search request received for ${domains.length} domains, page: ${page}, installed_software: ${installedSoftware}, route: ${route}`
  );

  if (!Array.isArray(domains) || domains.length === 0 || domains.length > 10) {
    logger.warn("Invalid input: domains array", {
      domainCount: domains.length,
    });
    return res.status(400).json({
      error: "Invalid domains array. Must contain 1-10 domains.",
    });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = domains.map(async (rawDomain) => {
      const domain = await sanitizeDomain(rawDomain);
      if (!domain) {
        return { domain: rawDomain, error: "Invalid domain" };
      }

      const query = { Domains: domain };
      const { limit, skip } = getPaginationParams(page);

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
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByDomainBulk,
};

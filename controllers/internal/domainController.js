const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");

async function searchByDomain(req, res, next) {
  const rawDomain = req.body.domain || req.query.domain;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const route = req.baseUrl + req.path;

  logger.info(
    `Search initiated for domain: ${rawDomain}, page: ${page}, installed_software: ${installedSoftware}, route: ${route}`
  );

  if (!rawDomain) {
    logger.warn("No domain provided in the request");
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  const domain = await sanitizeDomain(rawDomain);

  if (!domain) {
    logger.warn(`Invalid domain after sanitization: ${rawDomain}`);
    return res.status(400).json({ error: "Invalid domain parameter" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");
    const query = { Domains: domain };
    const { limit, skip } = getPaginationParams(page);
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
      `Search completed for domain: ${domain}, total results: ${total}, route: ${route}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error(`Error in searchByDomain: ${error}, route: ${route}`);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByDomain,
};

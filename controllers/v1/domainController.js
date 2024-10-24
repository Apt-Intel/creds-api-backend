const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { sanitizeDomain } = require("../../utils/domainUtils");

async function searchByDomain(req, res, next) {
  const domain = req.body.domain || req.query.domain;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";

  logger.info(
    `Search initiated for domain: ${domain}, page: ${page}, installed_software: ${installedSoftware}, type: ${type}`
  );

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  const sanitizedDomain = await sanitizeDomain(domain);
  if (!sanitizedDomain) {
    return res.status(400).json({ error: "Invalid domain provided" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query =
      type === "all"
        ? { Emails: { $regex: `@${sanitizedDomain}$`, $options: "i" } }
        : { Employee: { $regex: `@${sanitizedDomain}$`, $options: "i" } };
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
      `Search completed for domain: ${domain}, total results: ${total}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByDomain:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByDomain,
};

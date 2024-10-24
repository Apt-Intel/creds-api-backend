const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { performance } = require("perf_hooks");

async function searchByMailBulk(req, res, next) {
  const startTime = performance.now();
  const { mails } = req.body;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";

  logger.info(
    `Bulk search request received for ${mails.length} mails, page: ${page}, installed_software: ${installedSoftware}, type: ${type}`
  );

  if (!Array.isArray(mails) || mails.length === 0 || mails.length > 10) {
    logger.warn("Invalid input: mails array", { mailCount: mails.length });
    return res.status(400).json({
      error: "Invalid mails array. Must contain 1-10 email addresses.",
    });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const searchPromises = mails.map(async (mail) => {
      const query = type === "all" ? { Emails: mail } : { Employee: mail };
      const { limit, skip } = getPaginationParams(page);

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        mail,
        total,
        data: results,
      };
    });

    const searchResults = await Promise.all(searchPromises);

    const totalResults = searchResults.reduce(
      (sum, result) => sum + result.total,
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
        mails.length
      } mails, total results: ${totalResults}, processing time: ${totalTime.toFixed(
        2
      )}ms`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMailBulk:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByMailBulk,
};

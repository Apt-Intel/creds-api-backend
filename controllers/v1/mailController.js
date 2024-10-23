const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");

async function searchByMail(req, res, next) {
  const mail = req.body.mail || req.query.mail;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";

  logger.info(
    `Search initiated for mail: ${mail}, page: ${page}, installed_software: ${installedSoftware}`
  );

  if (!mail) {
    return res.status(400).json({ error: "Mail parameter is required" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query = { Emails: mail };
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

    logger.info(`Search completed for mail: ${mail}, total results: ${total}`);

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMail:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByMail,
};

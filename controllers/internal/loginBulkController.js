const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");

async function internalSearchByLoginBulk(req, res, next) {
  const { logins } = req.body;
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";
  const route = req.baseUrl + req.path;

  logger.info(
    `Internal bulk search initiated for ${logins.length} logins, page: ${page}, installed_software: ${installedSoftware}, route: ${route}`
  );

  if (!Array.isArray(logins) || logins.length === 0 || logins.length > 10) {
    return res.status(400).json({
      error: "Invalid logins array. Must contain 1-10 email addresses.",
    });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const { limit, skip } = getPaginationParams(page);

    const searchPromises = logins.map(async (login) => {
      const query = { Usernames: login };
      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);
      return { login, total, data: results };
    });

    const searchResults = await Promise.all(searchPromises);

    const response = {
      total: searchResults.reduce((sum, result) => sum + result.total, 0),
      page,
      results: searchResults,
    };

    logger.info(
      `Internal bulk search completed, total results: ${response.total}, route: ${route}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error(
      `Error in internalSearchByLoginBulk: ${error}, route: ${route}`
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  internalSearchByLoginBulk,
};

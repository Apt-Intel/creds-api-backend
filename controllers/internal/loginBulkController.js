const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const validator = require("validator");

async function internalSearchByLoginBulk(req, res, next) {
  const { logins } = req.body;
  const page = parseInt(req.query.page, 10);
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";
  const route = req.baseUrl + req.path;

  logger.info(
    `Internal bulk search initiated for ${logins?.length} logins, page: ${page}, installed_software: ${installedSoftware}, sortby: ${sortby}, sortorder: ${sortorder}, route: ${route}`
  );

  try {
    // Validate 'logins' parameter
    if (!Array.isArray(logins) || logins.length === 0 || logins.length > 10) {
      logger.warn(`Invalid logins array: ${logins?.length}, route: ${route}`);
      return res.status(400).json({
        error: "Invalid logins array. Must contain 1-10 login addresses.",
      });
    }

    // Validate 'page' parameter
    if (isNaN(page) || page < 1) {
      logger.warn(`Invalid page parameter: ${req.query.page}, route: ${route}`);
      return res.status(400).json({ error: "Invalid 'page' parameter" });
    }

    // Validate 'sortby' parameter
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      logger.warn(`Invalid sortby parameter: ${sortby}, route: ${route}`);
      return res.status(400).json({ error: "Invalid 'sortby' parameter" });
    }

    // Validate 'sortorder' parameter
    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      logger.warn(`Invalid sortorder parameter: ${sortorder}, route: ${route}`);
      return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
    }

    // Sanitize each login in the 'logins' array
    const sanitizedLogins = logins.map((login) => validator.escape(login));

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const { limit, skip } = getPaginationParams(page);

    const searchPromises = sanitizedLogins.map(async (login) => {
      // Use parameterized query with sanitized input
      const query = { Usernames: login };

      // TODO: Implement projection to limit returned fields
      // This will optimize query performance and reduce data transfer
      // Example: const projection = { _id: 0, Usernames: 1, "Log date": 1, Date: 1 };
      // Discuss with the product team to determine which fields are necessary

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
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

module.exports = {
  internalSearchByLoginBulk,
};

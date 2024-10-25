const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const validator = require("validator");

async function internalSearchByLogin(req, res, next) {
  const login = req.body.login || req.query.login;
  const page = parseInt(req.query.page, 10);
  const installedSoftware = req.query.installed_software === "true";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";
  const route = req.baseUrl + req.path;

  logger.info(
    `Internal search initiated for login: ${login}, page: ${page}, installed_software: ${installedSoftware}, sortby: ${sortby}, sortorder: ${sortorder}, route: ${route}`
  );

  try {
    // Validate 'login' parameter
    if (!login || login.trim() === "") {
      logger.warn(`Invalid login parameter: ${login}, route: ${route}`);
      return res.status(400).json({ error: "Login parameter is required" });
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

    // Sanitize 'login' parameter
    const sanitizedLogin = validator.escape(login);

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    // Use parameterized query with sanitized input
    const query = { Usernames: sanitizedLogin };
    const { limit, skip } = getPaginationParams(page);

    // TODO: Implement projection to limit returned fields
    // This will optimize query performance and reduce data transfer
    // Example: const projection = { _id: 0, Usernames: 1, "Log date": 1, Date: 1 };
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
      `Internal search completed for login: ${sanitizedLogin}, total results: ${total}, route: ${route}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error(`Error in internalSearchByLogin: ${error}, route: ${route}`);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
}

module.exports = {
  internalSearchByLogin,
};

const { getDatabase } = require("../config/database");
const logger = require("../config/logger");
const { parseDate } = require("../services/dateService");
const { getPaginationParams } = require("../utils/paginationUtils");

async function searchByLogin(req, res) {
  const login = req.body.login || req.query.login;
  const sortBy = req.query.sortby || "date_compromised";
  const sortOrder = req.query.sortorder || "desc";
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";

  logger.info(`Searching for login: ${login}`);
  logger.info(
    `Query params: sortby=${sortBy}, sortorder=${sortOrder}, page=${page}, installed_software=${installedSoftware}`
  );

  if (!login) {
    return res.status(400).json({ error: "Login parameter is required" });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const query = { Usernames: login };
    const sort = {};
    if (sortBy === "date_uploaded") {
      sort.Date = sortOrder === "asc" ? 1 : -1;
    } else {
      sort["Log date"] = sortOrder === "asc" ? 1 : -1;
    }

    const { limit, skip } = getPaginationParams(page);

    const [results, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    logger.info("Normalizing results...");
    const normalizedResults = await Promise.all(
      results.map(async (result, index) => {
        logger.info(`Normalizing result ${index + 1}/${results.length}`);
        const normalizedLogDate = await parseDate(result["Log date"]);
        const normalizedDate = await parseDate(result.Date);
        logger.info(`Normalized Log date: ${normalizedLogDate}`);
        logger.info(`Normalized Date: ${normalizedDate}`);
        return {
          ...result,
          "Log date": normalizedLogDate,
          Date: normalizedDate,
        };
      })
    );

    // Sort the normalized results in memory to ensure correct ordering
    normalizedResults.sort((a, b) => {
      const dateA = sortBy === "date_uploaded" ? a.Date : a["Log date"];
      const dateB = sortBy === "date_uploaded" ? b.Date : b["Log date"];
      return sortOrder === "asc"
        ? new Date(dateA) - new Date(dateB)
        : new Date(dateB) - new Date(dateA);
    });

    const response = {
      total,
      page,
      results: normalizedResults,
    };

    res.json(response);
  } catch (error) {
    logger.error("Error in searchByLogin:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByLogin,
};

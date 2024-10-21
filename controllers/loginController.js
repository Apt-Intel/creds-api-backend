const { getDatabase } = require("../config/database");
const logger = require("../config/logger");
const { normalizeDate } = require("../services/dateService");
const { getPaginationParams } = require("../utils/paginationUtils");

async function searchByLogin(req, res) {
  const login = req.body.login || req.query.login;
  const sortBy = req.query.sortby || "date_compromised";
  const page = parseInt(req.query.page) || 1;
  const installedSoftware = req.query.installed_software === "true";

  logger.info(`Searching for login: ${login}`);
  logger.info(
    `Query params: sortby=${sortBy}, page=${page}, installed_software=${installedSoftware}`
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
      sort.Date = -1;
    } else {
      sort["Log date"] = -1;
    }

    const { limit, skip } = getPaginationParams(page);

    const [results, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    const normalizedResults = results.map((result) => ({
      ...result,
      Date: normalizeDate(result.Date),
      "Log date": normalizeDate(result["Log date"]),
    }));

    const response = {
      total,
      page,
      results: normalizedResults,
    };

    res.json(response);
  } catch (error) {
    logger.error("Error in searchByLogin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  searchByLogin,
};

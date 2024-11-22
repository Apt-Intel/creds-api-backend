const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const validator = require("validator");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createStandardResponse } = require("../../utils/responseUtils");
const { errorUtils } = require("../../utils/errorUtils");

async function searchByMail(req, res, next) {
  const startTime = performance.now();
  const mail = req.body.mail || req.query.mail;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Search initiated for mail: ${mail}, page: ${page}, page_size: ${pageSize}, installed_software: ${installedSoftware}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  try {
    // Validate 'mail' parameter
    if (!mail || !validator.isEmail(mail)) {
      throw errorUtils.validationError("Valid mail parameter is required", {
        parameter: "mail",
        received: mail,
      });
    }

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      logger.warn("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
      return res.status(400).json({ errors: paginationValidation.errors });
    }

    // Sanitize 'mail' parameter
    const sanitizedMail = validator.escape(mail);

    // Validate 'type' parameter
    const validTypes = ["strict", "all"];
    if (!validTypes.includes(type)) {
      logger.warn(`Invalid type parameter: ${type}`);
      return res.status(400).json({ error: "Invalid 'type' parameter" });
    }

    // Validate 'sortby' parameter
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      logger.warn(`Invalid sortby parameter: ${sortby}`);
      return res.status(400).json({ error: "Invalid 'sortby' parameter" });
    }

    // Validate 'sortorder' parameter
    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      logger.warn(`Invalid sortorder parameter: ${sortorder}`);
      return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
    }

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    // Use parameterized query
    const query =
      type === "all" ? { Emails: sanitizedMail } : { Employee: sanitizedMail };
    const { limit, skip } = getPaginationParams(page, pageSize);

    // Determine sort field based on sortby parameter
    const sortField = sortby === "date_uploaded" ? "Date" : "Date Compromised";
    const sortDirection = sortorder === "desc" ? -1 : 1;

    const [results, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    // Attach searchResults to req for further processing
    req.searchResults = {
      meta: {
        query_type: type,
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
      total,
      page,
      pageSize,
      data: results, // Raw data at the bottom
    };

    logger.info(`Search completed for mail: ${sanitizedMail}`, {
      total,
      page,
      pageSize: pageSize,
      requestId: req.requestId,
    });

    logger.info("Search by mail completed", {
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      total,
      page,
      pageSize: pageSize,
    });

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchByMail,
};

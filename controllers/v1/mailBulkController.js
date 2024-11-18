const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const { performance } = require("perf_hooks");
const validator = require("validator");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const { createBulkPaginatedResponse } = require("../../utils/responseUtils");

async function searchByMailBulk(req, res, next) {
  const startTime = performance.now();
  const { mails } = req.body;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
  const installedSoftware = req.query.installed_software === "true";
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(`Bulk search request received`, {
    mailCount: mails?.length,
    page,
    pageSize,
    type,
    sortby,
    sortorder,
    requestId: req.requestId,
  });

  try {
    // Validate 'mails' parameter
    if (!Array.isArray(mails) || mails.length === 0 || mails.length > 10) {
      logger.warn("Invalid input: mails array", { mailCount: mails?.length });
      return res.status(400).json({
        error: "Invalid mails array. Must contain 1-10 email addresses.",
      });
    }

    // Validate each email
    const invalidEmails = mails.filter((email) => !validator.isEmail(email));
    if (invalidEmails.length > 0) {
      logger.warn("Invalid email formats detected", { invalidEmails });
      return res.status(400).json({
        error: "Invalid email formats",
        invalidEmails,
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

    const sanitizedMails = mails.map((email) => validator.escape(email));

    const db = await getDatabase();
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection("logs");

    const { limit, skip } = getPaginationParams(page, pageSize);

    const searchPromises = sanitizedMails.map(async (mail) => {
      const query = type === "all" ? { Emails: mail } : { Employee: mail };

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

    const response = createBulkPaginatedResponse({
      totalResults,
      page,
      pageSize: limit,
      results: searchResults,
      metadata: {
        query_type: type,
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
    });

    logger.info(`Bulk search completed`, {
      mailCount: mails.length,
      totalResults,
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      requestId: req.requestId,
    });

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMailBulk:", {
      error: error.message,
      stack: error.stack,
      requestId: req.requestId,
    });
    next(error);
  }
}

module.exports = {
  searchByMailBulk,
};

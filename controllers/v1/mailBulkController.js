const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const {
  getPaginationParams,
  validatePaginationParams,
} = require("../../utils/paginationUtils");
const validator = require("validator");
const { DEFAULT_PAGE_SIZE } = require("../../config/constants");
const {
  createStandardResponse,
  createBulkItemResponse,
} = require("../../utils/responseUtils");
const errorUtils = require("../../utils/errorUtils");
const { performance } = require("perf_hooks");

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
    // Validate mails array
    if (!Array.isArray(mails) || mails.length === 0 || mails.length > 10) {
      throw errorUtils.validationError(
        "Invalid mails array. Must contain 1-10 email addresses.",
        {
          received: mails?.length,
        }
      );
    }

    // Validate each email
    const invalidEmails = mails.filter((email) => !validator.isEmail(email));
    if (invalidEmails.length > 0) {
      throw errorUtils.validationError("Invalid email formats detected", {
        invalidEmails,
      });
    }

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      throw errorUtils.validationError("Invalid pagination parameters", {
        errors: paginationValidation.errors,
      });
    }

    // Validate type parameter
    const validTypes = ["strict", "all"];
    if (!validTypes.includes(type)) {
      throw errorUtils.validationError("Invalid type parameter", {
        parameter: "type",
        received: type,
        allowed: validTypes,
      });
    }

    // Validate sort parameters
    const validSortBy = ["date_compromised", "date_uploaded"];
    if (!validSortBy.includes(sortby)) {
      throw errorUtils.validationError("Invalid sortby parameter", {
        parameter: "sortby",
        received: sortby,
        allowed: validSortBy,
      });
    }

    const validSortOrder = ["asc", "desc"];
    if (!validSortOrder.includes(sortorder)) {
      throw errorUtils.validationError("Invalid sortorder parameter", {
        parameter: "sortorder",
        received: sortorder,
        allowed: validSortOrder,
      });
    }

    const db = await getDatabase();
    if (!db) {
      throw errorUtils.serverError("Database connection not established");
    }

    const collection = db.collection("logs");
    const { limit, skip } = getPaginationParams(page, pageSize);

    // Process each mail with individual pagination
    const searchPromises = mails.map(async (mail) => {
      const sanitizedMail = validator.escape(mail);
      const query =
        type === "all"
          ? { Emails: sanitizedMail }
          : { Employee: sanitizedMail };

      const sortField =
        sortby === "date_uploaded" ? "Date" : "Date Compromised";
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

      // Create bulk item response with mail identifier
      return {
        mail: sanitizedMail,
        pagination: {
          total_items: total,
          total_pages: Math.ceil(total / pageSize),
          current_page: page,
          page_size: pageSize,
          has_next_page: skip + limit < total,
          has_previous_page: page > 1,
          next_page: skip + limit < total ? page + 1 : null,
          previous_page: page > 1 ? page - 1 : null,
        },
        data: results, // Raw results for middleware processing
      };
    });

    const searchResults = await Promise.all(searchPromises);
    const totalResults = searchResults.reduce(
      (sum, result) => sum + result.pagination.total_items,
      0
    );

    // Set searchResults on req object for middleware processing
    req.searchResults = {
      meta: {
        query_type: type,
        sort: {
          field: sortby,
          order: sortorder,
        },
        processing_time: `${(performance.now() - startTime).toFixed(2)}ms`,
      },
      search_counts: Object.fromEntries(
        searchResults.map((result) => [
          result.mail,
          result.pagination.total_items,
        ])
      ),
      total: totalResults,
      page,
      pageSize,
      data: searchResults, // Data at the bottom
    };

    logger.info("Bulk search completed", {
      processingTime: `${(performance.now() - startTime).toFixed(2)}ms`,
      totalResults,
      mailCount: mails.length,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchByMailBulk,
};

const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../config/constants");
const logger = require("../config/logger");

/**
 * Calculate pagination details
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Pagination details object
 */
function calculatePaginationDetails(total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    total_items: total,
    total_pages: totalPages,
    current_page: page,
    page_size: pageSize,
    has_next_page: hasNextPage,
    has_previous_page: hasPreviousPage,
    next_page: hasNextPage ? page + 1 : null,
    previous_page: hasPreviousPage ? page - 1 : null,
  };
}

/**
 * Get pagination parameters based on page number and page size
 * @param {number} page - The page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: DEFAULT_PAGE_SIZE)
 * @returns {Object} Object containing limit and skip values
 */
function getPaginationParams(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  // Ensure page is a positive integer
  const validatedPage = Math.max(1, parseInt(page, 10) || 1);

  // Validate and constrain page size
  const validatedPageSize = Math.min(
    Math.max(parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  const skip = (validatedPage - 1) * validatedPageSize;
  const limit = validatedPageSize;

  logger.debug("Pagination parameters calculated", {
    requestedPage: page,
    requestedPageSize: pageSize,
    validatedPage,
    validatedPageSize,
    skip,
    limit,
  });

  return { limit, skip };
}

/**
 * Validate pagination parameters
 * @param {number} page - The page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Object containing validation result and error message
 */
function validatePaginationParams(page, pageSize) {
  const errors = [];

  // Validate page
  if (page && (isNaN(page) || page < 1)) {
    errors.push(`Invalid 'page' parameter. Must be a positive integer.`);
  }

  // Validate page_size
  if (
    pageSize &&
    (isNaN(pageSize) || pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE)
  ) {
    errors.push(
      `Invalid 'page_size' parameter. Must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  getPaginationParams,
  validatePaginationParams,
  calculatePaginationDetails,
};

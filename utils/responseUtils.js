const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../config/constants");
const logger = require("../config/logger");

/**
 * Creates a standardized paginated response structure with backward compatibility
 */
function createPaginatedResponse({
  total,
  page,
  pageSize,
  results,
  metadata = {},
}) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  // Create new response structure
  const response = {
    // Legacy fields for backward compatibility
    total,
    page,
    page_size: pageSize,
    // New pagination structure
    pagination: {
      total_items: total,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
      has_next_page: hasNextPage,
      has_previous_page: hasPreviousPage,
      next_page: hasNextPage ? page + 1 : null,
      previous_page: hasPreviousPage ? page - 1 : null,
    },
    metadata,
    results,
  };

  logger.debug("Created paginated response with backward compatibility", {
    total,
    page,
    pageSize,
    totalPages,
  });

  return response;
}

/**
 * Creates a standardized bulk operation paginated response with backward compatibility
 */
function createBulkPaginatedResponse({
  totalResults,
  page,
  pageSize,
  results,
  metadata = {},
}) {
  // Create new response structure with legacy support
  const response = {
    // Legacy fields
    total: totalResults,
    page,
    page_size: pageSize,
    // New pagination structure
    pagination: {
      total_items: totalResults,
      current_page: page,
      page_size: pageSize,
    },
    metadata,
    results: results.map((result) => ({
      ...result,
      // Legacy fields for each result
      total: result.total,
      // New pagination structure for each result
      pagination: {
        total_items: result.total,
        total_pages: Math.ceil(result.total / pageSize),
        current_page: page,
        page_size: pageSize,
      },
    })),
  };

  logger.debug("Created bulk paginated response with backward compatibility", {
    totalResults,
    page,
    pageSize,
  });

  return response;
}

module.exports = {
  createPaginatedResponse,
  createBulkPaginatedResponse,
};

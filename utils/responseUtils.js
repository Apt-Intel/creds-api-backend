const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../config/constants");
const logger = require("../config/logger");

/**
 * Creates a standardized response object for single endpoints
 * @param {Object} params
 * @param {number} params.total - Total number of items
 * @param {number} params.page - Current page number
 * @param {number} params.pageSize - Number of items per page
 * @param {Array} params.results - Array of result items
 * @param {Object} params.metadata - Additional metadata (query_type, sort, etc.)
 * @returns {Object} Standardized response object
 */
function createStandardResponse({
  total,
  page,
  pageSize,
  results,
  metadata = {},
}) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    meta: {
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
      ...metadata,
    },
    data: results,
  };
}

/**
 * Creates a standardized response object for bulk endpoints
 * @param {Object} params
 * @param {number} params.total - Total number of items
 * @param {number} params.page - Current page number
 * @param {number} params.pageSize - Number of items per page
 * @param {Array} params.results - Array of result items with their identifiers
 * @param {Object} params.metadata - Additional metadata (query_type, sort, processing_time)
 * @param {Object} params.searchCounts - Count of results per search term
 * @returns {Object} Standardized bulk response object
 */
function createBulkResponse({
  total,
  page,
  pageSize,
  results,
  metadata = {},
  searchCounts = {},
}) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    meta: {
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
      ...metadata,
      search_counts: searchCounts,
    },
    data: results,
  };
}

/**
 * Flattens bulk search results and computes search counts
 * @param {Array} searchResults - Array of search results with identifiers
 * @param {string} identifierKey - Key name for the identifier (mail, domain, login)
 * @returns {Object} Object containing flattened data and search counts
 */
function processBulkResults(searchResults, identifierKey) {
  const flattenedData = [];
  const searchCounts = {};

  searchResults.forEach((result) => {
    const identifier = result[identifierKey];
    const dataItems = result.data || [];

    searchCounts[identifier] = dataItems.length;

    dataItems.forEach((item) => {
      flattenedData.push({
        [identifierKey]: identifier,
        item,
      });
    });
  });

  return {
    flattenedData,
    searchCounts,
  };
}

module.exports = {
  createStandardResponse,
  createBulkResponse,
  processBulkResults,
};

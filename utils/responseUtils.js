const { calculatePaginationDetails } = require("./paginationUtils");

/**
 * Creates a standardized response object for single endpoints
 * @param {Object} params
 * @param {number} params.total - Total number of items
 * @param {number} params.page - Current page number
 * @param {number} params.pageSize - Number of items per page
 * @param {Array} params.results - Array of result items
 * @param {Object} params.meta - Additional metadata (query_type, sort, etc.)
 * @returns {Object} Standardized response object
 */
function createStandardResponse({ total, page, pageSize, results, meta = {} }) {
  const paginationDetails = calculatePaginationDetails(total, page, pageSize);

  return {
    meta: {
      pagination: paginationDetails,
      ...meta,
    },
    data: results,
  };
}

/**
 * Creates a standardized response object for individual bulk items
 * @param {Object} params
 * @param {string} params.identifier - Identifier of the item
 * @param {number} params.total - Total number of items
 * @param {number} params.page - Current page number
 * @param {number} params.pageSize - Number of items per page
 * @param {Array} params.results - Array of result items
 * @returns {Object} Standardized bulk item response object
 */
function createBulkItemResponse({
  identifier,
  total,
  page,
  pageSize,
  results,
}) {
  const paginationDetails = calculatePaginationDetails(total, page, pageSize);

  // Determine the identifier type (mail, domain, or login)
  const identifierType = identifier.includes("@")
    ? "mail"
    : identifier.includes(".")
    ? "domain"
    : "login";

  return {
    [identifierType]: identifier,
    pagination: paginationDetails,
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
 * @param {Object} params.meta - Additional metadata (query_type, sort, processing_time)
 * @param {Object} params.searchCounts - Count of results per search term
 * @returns {Object} Standardized bulk response object
 */
function createBulkResponse({
  total,
  page,
  pageSize,
  results,
  meta = {},
  searchCounts = {},
}) {
  const paginationDetails = calculatePaginationDetails(total, page, pageSize);

  return {
    meta: {
      pagination: paginationDetails,
      ...meta,
      search_counts: searchCounts,
    },
    data: results,
  };
}

module.exports = {
  createStandardResponse,
  createBulkItemResponse,
  createBulkResponse,
};

const logger = require("../config/logger");

const documentRedesignMiddleware = async (req, res, next) => {
  try {
    // Skip if no results in response
    if (!req.searchResults?.data) {
      return next();
    }

    // Process data array
    const processedData = await Promise.all(
      req.searchResults.data.map(async (item) => {
        // For bulk endpoints, item has mail/domain and item properties
        const docToProcess = item.item || item;
        const identifier = item.mail || item.domain || null;

        // Apply document redesign logic
        const processedDoc = await redesignDocument(docToProcess);

        // Return in appropriate format based on endpoint type
        if (identifier) {
          // Bulk endpoint
          return {
            [identifier.includes("@") ? "mail" : "domain"]: identifier,
            item: {
              ...processedDoc,
              InternalCredentials: [],
              ExternalCredentials: [],
              OtherCredentials: [],
            },
          };
        } else {
          // Single endpoint
          return {
            ...processedDoc,
            InternalCredentials: [],
            ExternalCredentials: [],
            OtherCredentials: [],
          };
        }
      })
    );

    // Update the response data
    req.searchResults.data = processedData;

    next();
  } catch (error) {
    logger.error("Error in document redesign middleware:", {
      error: error.message,
      requestId: req.requestId,
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * Helper function to redesign a single document
 * Keeping existing document processing logic
 */
async function redesignDocument(doc) {
  // Preserve existing document processing logic
  return {
    ...doc,
    // Add any necessary transformations here
    // but maintain backward compatibility
  };
}

module.exports = documentRedesignMiddleware;

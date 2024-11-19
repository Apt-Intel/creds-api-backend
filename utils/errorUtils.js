const { createAPIError } = require("../middlewares/errorHandlerMiddleware");

const errorUtils = {
  /**
   * Common validation error
   */
  validationError: (message, details) => {
    return createAPIError(message, 400, details);
  },

  /**
   * Authentication error
   */
  authError: (message = "Authentication required") => {
    return createAPIError(message, 401);
  },

  /**
   * Rate limit exceeded error
   */
  rateLimitError: (message, retryAfter) => {
    const error = createAPIError(message, 429);
    error.retryAfter = retryAfter;
    return error;
  },

  /**
   * Not found error
   */
  notFoundError: (resource = "Resource") => {
    return createAPIError(`${resource} not found`, 404);
  },

  /**
   * Server error
   */
  serverError: (message = "Internal server error") => {
    return createAPIError(message, 500);
  },
};

module.exports = errorUtils;

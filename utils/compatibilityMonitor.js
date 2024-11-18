const logger = require("../config/logger");

class CompatibilityMonitor {
  static logCompatibilityIssue(issue) {
    logger.warn("Backward compatibility issue detected", {
      issue,
      timestamp: new Date().toISOString(),
    });
  }

  static monitorResponseFormat(response) {
    // Check for required legacy fields
    const requiredFields = ["total", "page", "page_size", "results"];
    const missingFields = requiredFields.filter(
      (field) => !(field in response)
    );

    if (missingFields.length > 0) {
      this.logCompatibilityIssue({
        type: "missing_fields",
        fields: missingFields,
      });
    }

    // Monitor pagination structure
    if (response.pagination) {
      const paginationFields = [
        "total_items",
        "total_pages",
        "current_page",
        "page_size",
      ];
      const missingPaginationFields = paginationFields.filter(
        (field) => !(field in response.pagination)
      );

      if (missingPaginationFields.length > 0) {
        this.logCompatibilityIssue({
          type: "missing_pagination_fields",
          fields: missingPaginationFields,
        });
      }
    }

    return response;
  }
}

module.exports = CompatibilityMonitor;

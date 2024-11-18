const {
  createPaginatedResponse,
  createBulkPaginatedResponse,
} = require("../utils/responseUtils");

describe("Backward Compatibility Tests", () => {
  describe("Single Search Response", () => {
    it("should maintain legacy fields while adding new pagination structure", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: 2,
        pageSize: 20,
        results: [],
      });

      // Test legacy fields
      expect(response).toHaveProperty("total", 100);
      expect(response).toHaveProperty("page", 2);
      expect(response).toHaveProperty("page_size", 20);

      // Test new pagination structure
      expect(response).toHaveProperty("pagination");
      expect(response.pagination).toHaveProperty("total_items", 100);
      expect(response.pagination).toHaveProperty("current_page", 2);
    });

    it("should work with default page size for legacy clients", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: 1,
        pageSize: 50, // Default size
        results: [],
      });

      expect(response.page_size).toBe(50);
      expect(response.pagination.page_size).toBe(50);
    });
  });

  describe("Bulk Search Response", () => {
    it("should maintain legacy fields in bulk responses", () => {
      const response = createBulkPaginatedResponse({
        totalResults: 150,
        page: 1,
        pageSize: 20,
        results: [
          {
            item: "test1",
            total: 50,
            data: [],
          },
          {
            item: "test2",
            total: 100,
            data: [],
          },
        ],
      });

      // Test legacy fields
      expect(response).toHaveProperty("total", 150);
      expect(response).toHaveProperty("page", 1);
      expect(response).toHaveProperty("page_size", 20);

      // Test nested results
      response.results.forEach((result) => {
        expect(result).toHaveProperty("total");
        expect(result).toHaveProperty("pagination");
      });
    });
  });

  describe("Error Response Compatibility", () => {
    it("should maintain consistent error response format", () => {
      const response = {
        errors: [
          "Invalid 'page_size' parameter. Must be an integer between 1 and 50.",
        ],
      };

      expect(response).toHaveProperty("errors");
      expect(Array.isArray(response.errors)).toBe(true);
    });
  });

  describe("Default Behavior", () => {
    it("should use default page size when not specified", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: 1,
        pageSize: undefined,
        results: [],
      });

      expect(response.page_size).toBe(50);
      expect(response.pagination.page_size).toBe(50);
    });

    it("should handle legacy clients not sending page parameter", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: undefined,
        pageSize: 50,
        results: [],
      });

      expect(response.page).toBe(1);
      expect(response.pagination.current_page).toBe(1);
    });
  });
});

const {
  createPaginatedResponse,
  createBulkPaginatedResponse,
} = require("../utils/responseUtils");

describe("Response Utils", () => {
  describe("createPaginatedResponse", () => {
    it("should create correct pagination metadata", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: 2,
        pageSize: 20,
        results: [],
        metadata: { test: true },
      });

      expect(response).toEqual({
        pagination: {
          total_items: 100,
          total_pages: 5,
          current_page: 2,
          page_size: 20,
          has_next_page: true,
          has_previous_page: true,
          next_page: 3,
          previous_page: 1,
        },
        metadata: { test: true },
        results: [],
      });
    });

    it("should handle first page correctly", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: 1,
        pageSize: 20,
        results: [],
      });

      expect(response.pagination).toEqual({
        total_items: 100,
        total_pages: 5,
        current_page: 1,
        page_size: 20,
        has_next_page: true,
        has_previous_page: false,
        next_page: 2,
        previous_page: null,
      });
    });

    it("should handle last page correctly", () => {
      const response = createPaginatedResponse({
        total: 100,
        page: 5,
        pageSize: 20,
        results: [],
      });

      expect(response.pagination).toEqual({
        total_items: 100,
        total_pages: 5,
        current_page: 5,
        page_size: 20,
        has_next_page: false,
        has_previous_page: true,
        next_page: null,
        previous_page: 4,
      });
    });
  });

  describe("createBulkPaginatedResponse", () => {
    it("should create correct bulk response structure", () => {
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
        metadata: { test: true },
      });

      expect(response).toEqual({
        pagination: {
          total_items: 150,
          current_page: 1,
          page_size: 20,
        },
        metadata: { test: true },
        results: [
          {
            item: "test1",
            total: 50,
            pagination: {
              total_items: 50,
              total_pages: 3,
              current_page: 1,
              page_size: 20,
            },
            data: [],
          },
          {
            item: "test2",
            total: 100,
            pagination: {
              total_items: 100,
              total_pages: 5,
              current_page: 1,
              page_size: 20,
            },
            data: [],
          },
        ],
      });
    });

    it("should handle empty results", () => {
      const response = createBulkPaginatedResponse({
        totalResults: 0,
        page: 1,
        pageSize: 20,
        results: [],
      });

      expect(response).toEqual({
        pagination: {
          total_items: 0,
          current_page: 1,
          page_size: 20,
        },
        metadata: {},
        results: [],
      });
    });
  });
});

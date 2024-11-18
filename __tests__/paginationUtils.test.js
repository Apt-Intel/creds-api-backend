const {
  getPaginationParams,
  validatePaginationParams,
} = require("../utils/paginationUtils");
const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../config/constants");

describe("Pagination Utils", () => {
  describe("getPaginationParams", () => {
    it("should return default values when no parameters provided", () => {
      const result = getPaginationParams();
      expect(result).toEqual({
        limit: DEFAULT_PAGE_SIZE,
        skip: 0,
      });
    });

    it("should calculate correct skip value", () => {
      const result = getPaginationParams(3, 10);
      expect(result).toEqual({
        limit: 10,
        skip: 20,
      });
    });

    it("should handle invalid page number", () => {
      const result = getPaginationParams(-1, 10);
      expect(result).toEqual({
        limit: 10,
        skip: 0,
      });
    });

    it("should handle invalid page size", () => {
      const result = getPaginationParams(1, -1);
      expect(result).toEqual({
        limit: DEFAULT_PAGE_SIZE,
        skip: 0,
      });
    });

    it("should enforce maximum page size", () => {
      const result = getPaginationParams(1, MAX_PAGE_SIZE + 1);
      expect(result).toEqual({
        limit: MAX_PAGE_SIZE,
        skip: 0,
      });
    });

    it("should enforce minimum page size", () => {
      const result = getPaginationParams(1, MIN_PAGE_SIZE - 1);
      expect(result).toEqual({
        limit: MIN_PAGE_SIZE,
        skip: 0,
      });
    });
  });

  describe("validatePaginationParams", () => {
    it("should validate correct parameters", () => {
      const result = validatePaginationParams(1, 20);
      expect(result).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it("should validate default parameters", () => {
      const result = validatePaginationParams();
      expect(result).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it("should invalidate negative page number", () => {
      const result = validatePaginationParams(-1, 20);
      expect(result).toEqual({
        isValid: false,
        errors: ["Invalid 'page' parameter. Must be a positive integer."],
      });
    });

    it("should invalidate page size exceeding maximum", () => {
      const result = validatePaginationParams(1, MAX_PAGE_SIZE + 1);
      expect(result).toEqual({
        isValid: false,
        errors: [
          `Invalid 'page_size' parameter. Must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}.`,
        ],
      });
    });

    it("should invalidate page size below minimum", () => {
      const result = validatePaginationParams(1, MIN_PAGE_SIZE - 1);
      expect(result).toEqual({
        isValid: false,
        errors: [
          `Invalid 'page_size' parameter. Must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}.`,
        ],
      });
    });

    it("should invalidate non-numeric values", () => {
      const result = validatePaginationParams("invalid", "invalid");
      expect(result).toEqual({
        isValid: false,
        errors: [
          "Invalid 'page' parameter. Must be a positive integer.",
          `Invalid 'page_size' parameter. Must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}.`,
        ],
      });
    });
  });
});

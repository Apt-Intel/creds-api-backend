# Writing Tests

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Testing Pagination](#testing-pagination)
4. [Testing Response Formats](#testing-response-formats)
5. [Testing Backward Compatibility](#testing-backward-compatibility)

## Testing Pagination

### Pagination Test Cases

When writing tests for endpoints that support pagination, ensure coverage of the following scenarios:

1. **Basic Pagination Parameters**

```javascript
describe("Pagination Parameters", () => {
  it("should use default pagination values when none provided", async () => {
    // Test default values (page=1, page_size=50)
  });

  it("should use custom page_size within limits", async () => {
    // Test with valid page_size
  });

  it("should handle invalid page_size parameter", async () => {
    // Test error handling for invalid page_size
  });
});
```

2. **Edge Cases**

```javascript
describe("Pagination Edge Cases", () => {
  it("should handle page_size at minimum limit", async () => {
    // Test with MIN_PAGE_SIZE
  });

  it("should handle page_size at maximum limit", async () => {
    // Test with MAX_PAGE_SIZE
  });

  it("should handle empty result sets", async () => {
    // Test pagination with no results
  });
});
```

3. **Response Format**

```javascript
describe("Pagination Response Format", () => {
  it("should include correct pagination metadata", async () => {
    // Test pagination metadata structure
  });

  it("should maintain backward compatibility", async () => {
    // Test legacy fields presence
  });
});
```

### Testing Backward Compatibility

1. **Response Structure Tests**

```javascript
describe("Backward Compatibility", () => {
  it("should maintain legacy fields while adding new pagination structure", () => {
    // Test both old and new fields
  });

  it("should work with default page size for legacy clients", () => {
    // Test default behavior
  });
});
```

2. **Error Response Tests**

```javascript
describe("Error Handling", () => {
  it("should return consistent error format", () => {
    // Test error response structure
  });
});
```

### Example Test Implementation

```javascript
const request = require("supertest");
const app = require("../app");

describe("API Endpoint Tests", () => {
  describe("GET /api/search", () => {
    it("should paginate results correctly", async () => {
      const response = await request(app).get("/api/search").query({
        page: 2,
        page_size: 20,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toMatchObject({
        total_items: expect.any(Number),
        total_pages: expect.any(Number),
        current_page: 2,
        page_size: 20,
      });
    });
  });
});
```

---

By following these guidelines, developers can ensure that tests are consistently written and maintained, leading to a more robust and reliable application.

---

**Moving Forward**

- **Remove** redundant scripts if their functionality is covered by automated tests.
- **Place** any necessary manual scripts in the `scripts/` directory for clarity.
- **Ensure** all new tests adhere to the standards outlined in this documentation.

---

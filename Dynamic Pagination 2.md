# Plan to Standardize and Clean API Response Structure

**Objective:** Update the API response structure across all endpoints to match the new standardized format, without introducing new API versioning or maintaining backward compatibility, since we are in the development phase.

---

## Overview

We will update the response structure of all relevant endpoints to align with the specified formats for single and bulk responses.

---

## Step-by-Step Implementation Plan

### Step 1: Identify All Affected Components

#### 1.1 Controllers That Generate API Responses

- `controllers/v1/mailController.js`
- `controllers/v1/mailBulkController.js`
- `controllers/v1/domainController.js`
- `controllers/v1/domainBulkController.js`
- `controllers/internal/loginController.js`
- `controllers/internal/loginBulkController.js`
- `controllers/internal/domainController.js`
- `controllers/internal/domainBulkController.js`

#### 1.2 Utility Functions and Middleware

- `utils/responseUtils.js` (if existing)
- `utils/paginationUtils.js`
- Any middleware that constructs or modifies API responses

---

### Step 2: Define the New Standardized Response Structures

#### 2.1 Single Endpoint Response Format

```json
{
  "meta": {
    "pagination": {
      "total_items": 9,
      "total_pages": 1,
      "current_page": 1,
      "page_size": 50,
      "has_next_page": false,
      "has_previous_page": false,
      "next_page": null,
      "previous_page": null
    },
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "asc"
    }
  },
  "data": [
    /* result items */
  ]
}
```

#### 2.2 Bulk Endpoint Response Format

```json
{
  "meta": {
    "pagination": {
      "total_items": 9,
      "total_pages": 1,
      "current_page": 1,
      "page_size": 50,
      "has_next_page": false,
      "has_previous_page": false,
      "next_page": null,
      "previous_page": null
    },
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "asc"
    },
    "processing_time": "3881.15ms",
    "search_counts": {
      "example1@domain.com": 8,
      "example2@domain.com": 1
    }
  },
  "data": [
    {
      "mail": "example1@domain.com",
      "item": {
        /* result item */
      }
    },
    {
      "mail": "example1@domain.com",
      "item": {
        /* result item */
      }
    },
    {
      "mail": "example2@domain.com",
      "item": {
        /* result item */
      }
    }
    // ... more items
  ]
}
```

---

### Step 3: Update Controllers to Match the New Structure

#### 3.1 Modify Response Construction in Controllers

For each affected controller:

- Replace the existing response structure with the new one.
- Wrap existing `pagination`, `metadata`, and `results` into the new `meta` and `data` fields.

**Example:**

In `controllers/v1/mailController.js`:

```javascript
// After fetching data and computing pagination

const response = {
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
    query_type: type,
    sort: {
      field: sortBy,
      order: sortOrder,
    },
  },
  data: results,
};

res.json(response);
```

#### 3.2 Update Bulk Controllers to Flatten Data and Include `search_counts`

For bulk endpoints:

- Flatten the results into a single `data` array.
- Each item in `data` should include the identifier (`mail`, `domain`, or `login`) and the corresponding result item.
- Compute `search_counts` to indicate how many results were found for each search term.

**Example:**

In `controllers/v1/mailBulkController.js`:

```javascript
// After fetching data for each mail

// Flatten data and collect search counts
let flattenedData = [];
let searchCounts = {};

searchResults.forEach((result) => {
  const mail = result.mail;
  const dataItems = result.data;

  searchCounts[mail] = dataItems.length;

  dataItems.forEach((item) => {
    flattenedData.push({
      mail: mail,
      item: item,
    });
  });
});

const response = {
  meta: {
    pagination: {
      total_items: totalResults,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
      has_next_page: hasNextPage,
      has_previous_page: hasPreviousPage,
      next_page: hasNextPage ? page + 1 : null,
      previous_page: hasPreviousPage ? page - 1 : null,
    },
    query_type: type,
    sort: {
      field: sortBy,
      order: sortOrder,
    },
    processing_time: `${processingTime}ms`,
    search_counts: searchCounts,
  },
  data: flattenedData,
};

res.json(response);
```

---

### Step 4: Update Utility Functions

#### 4.1 Modify or Create Response Utility Functions

- If `utils/responseUtils.js` exists, update the `createPaginatedResponse` and `createBulkPaginatedResponse` functions to generate responses in the new format.
- If it doesn't exist, consider creating utility functions to centralize response construction logic.

**Example:**

In `utils/responseUtils.js`:

```javascript
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
```

---

### Step 5: Update Middleware if Necessary

- Review any middleware that contributes to the response structure.
- Ensure middleware outputs align with the new response format.

---

### Step 6: Review and Test Thoroughly

- Perform code reviews to ensure that all changes are consistent and correctly implemented.
- Conduct thorough testing, including:
  - Unit tests
  - Integration tests
  - Manual testing with API clients

---

## Potential Challenges and Mitigation Strategies

### Challenge 1: Inconsistencies Across Endpoints

- **Mitigation:** Use utility functions for response construction to ensure consistency.

### Challenge 2: Missing Updates in Some Controllers

- **Mitigation:** Double-check all controllers listed in Step 1 to ensure they are updated.

---

## Conclusion

By following this plan, we will standardize the API response structure across all endpoints, improving consistency and maintainability. Making these changes now, during the development phase, will prevent future issues and streamline the API for client consumption.

---

# Summary

- **No API versioning**: We will update existing endpoints directly.
- **No backward compatibility concerns**: Not required in the development phase.
- **Standardized response structures**: Defined for single and bulk endpoints.
- **Affected files identified**: Controllers, utilities, middleware, tests, and documentation.
- **Steps outlined**: Modify controllers, update utilities, adjust middleware, update tests, update documentation.
- **Potential challenges addressed**: Ensured consistency and thorough testing.

---

**Next Steps for the Dev Team:**

1. Start updating controllers as per Step 3.
2. Modify or create utility functions in `utils/responseUtils.js`.
3. Review middleware and adjust if necessary.
4. Conduct code reviews and testing before merging changes.

---

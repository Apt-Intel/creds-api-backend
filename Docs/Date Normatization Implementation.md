# Date Normalization Implementation

## Overview

Date normalization is a crucial part of our application, ensuring consistent date formats across different data sources and user inputs. This document outlines how date normalization is implemented, why it's necessary, and how it works within our codebase.

## Purpose

Date normalization is essential in our application to ensure consistent date representations across various data sources and user inputs. This consistency is crucial for:

1. Accurate sorting and filtering of data based on dates.
2. Consistent display of date information across the application.
3. Improved data quality and reduced errors in date-based operations.
4. Facilitating log analysis and user activity tracking.

## Relevant Files

1. [`services/dateService.js`](services/dateService.js): Core date parsing and normalization logic.
2. [`middlewares/dateNormalizationMiddleware.js`](middlewares/dateNormalizationMiddleware.js): Middleware for normalizing dates in responses.
3. [`middlewares/sortingMiddleware.js`](middlewares/sortingMiddleware.js): Middleware for sorting normalized dates.
4. [`controllers/loginController.js`](controllers/loginController.js): Controller for single login search.
5. [`controllers/loginBulkController.js`](controllers/loginBulkController.js): Controller for bulk login search.
6. [`routes/api/v1/searchByLogin.js`](routes/api/v1/searchByLogin.js): Routes for single login search.
7. [`routes/api/v1/searchByLoginBulk.js`](routes/api/v1/searchByLoginBulk.js): Routes for bulk login search.
8. [`logs/new_date_formats.log`](logs/new_date_formats.log): Log file for unrecognized date formats.

## New Flow for Date Normalization and Sorting

The new flow for date normalization and sorting follows these steps:

1. Controller fetches raw data from the database.
2. Date Normalization Middleware normalizes the "Log date" fields.
3. Sorting Middleware sorts the normalized data based on query parameters.
4. Response is sent with normalized and sorted data.

### 1. Controller (e.g., loginController.js)

The controller fetches data from the database without applying any sorting or normalization:

```javascript
async function searchByLogin(req, res, next) {
  // ... (input validation and setup)
  try {
    const db = await getDatabase();
    const collection = db.collection("logs");
    const query = { Usernames: login };
    const { limit, skip } = getPaginationParams(page);
    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);
    const response = {
      total,
      page,
      results,
    };
    req.searchResults = response;
    next();
  } catch (error) {
    // ... (error handling)
  }
}
```

### 2. Date Normalization Middleware (dateNormalizationMiddleware.js)

This middleware normalizes the "Log date" fields in the response:### 2. Date Normalization Middleware (dateNormalizationMiddleware.js)

This middleware normalizes the "Log date" fields in the response:

```javascript
const normalizeData = async (data) => {
  if (Array.isArray(data)) {
    return Promise.all(data.map(normalizeData));
  }
  if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    if ("Log date" in newData) {
      newData["Log date"] = await parseDate(newData["Log date"]);
    }
    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = await Promise.all(newData.data.map(normalizeData));
    }
    if ("results" in newData && Array.isArray(newData.results)) {
      newData.results = await Promise.all(newData.results.map(normalizeData));
    }
    return newData;
  }
  return data;
};
const dateNormalizationMiddleware = async (req, res, next) => {
  try {
    if (req.searchResults) {
      req.searchResults = await normalizeData(req.searchResults);
    }
    next();
  } catch (error) {
    // ... (error handling)
  }
};
```

### 3. Sorting Middleware (sortingMiddleware.js)

This middleware sorts the normalized data based on query parameters:

```javascript
const sortData = (data, sortBy, sortOrder) => {
  if (Array.isArray(data)) {
    return data.sort((a, b) => {
      const dateA = new Date(a[sortBy]);
      const dateB = new Date(b[sortBy]);
      const comparison = dateA - dateB;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }
  if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = sortData(newData.data, sortBy, sortOrder);
    }
    if ("results" in newData && Array.isArray(newData.results)) {
      if (newData.results.length > 0 && "data" in newData.results[0]) {
        // Bulk search results
        newData.results = newData.results.map((result) => ({
          ...result,
          data: sortData(result.data, sortBy, sortOrder),
        }));
      } else {
        // Single search results
        newData.results = sortData(newData.results, sortBy, sortOrder);
      }
    }
    return newData;
  }
  return data;
};
const sortingMiddleware = (req, res, next) => {
  try {
    const sortBy = req.query.sortby || "date_compromised";
    const sortOrder = req.query.sortorder || "desc";
    const sortField = sortBy === "date_uploaded" ? "Date" : "Log date";
    if (req.searchResults) {
      req.searchResults = sortData(req.searchResults, sortField, sortOrder);
    }
    next();
  } catch (error) {
    // ... (error handling)
  }
};
const sortData = (data, sortBy, sortOrder) => {
  if (Array.isArray(data)) {
    return data.sort((a, b) => {
      const dateA = new Date(a[sortBy]);
      const dateB = new Date(b[sortBy]);
      const comparison = dateA - dateB;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }
  if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = sortData(newData.data, sortBy, sortOrder);
    }
    if ("results" in newData && Array.isArray(newData.results)) {
      if (newData.results.length > 0 && "data" in newData.results[0]) {
        // Bulk search results
        newData.results = newData.results.map((result) => ({
          ...result,
          data: sortData(result.data, sortBy, sortOrder),
        }));
      } else {
        // Single search results
        newData.results = sortData(newData.results, sortBy, sortOrder);
      }
    }
    return newData;
  }
  return data;
};
const sortingMiddleware = (req, res, next) => {
  try {
    const sortBy = req.query.sortby || "date_compromised";
    const sortOrder = req.query.sortorder || "desc";
    const sortField = sortBy === "date_uploaded" ? "Date" : "Log date";
    if (req.searchResults) {
      req.searchResults = sortData(req.searchResults, sortField, sortOrder);
    }
    next();
  } catch (error) {
    // ... (error handling)
  }
};
```

### 4. Route Configuration

Configure the route to use these middlewares in the correct order:

```javascript
router.get(
  "/search-by-login",
  searchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
```

## Date Normalization and Sorting: Input and Output Examples

This document provides examples of input and output for the date normalization and sorting processes in our application.

### Date Normalization Example

#### Input (raw data from database):

```json
{
  "results": [
    {
      "Log date": "17.05.2022 5:28:48",
      "Date": "2022-05-17",
      "other_field": "some value"
    },
    {
      "Log date": "2022-05-18T10:15:30.000Z",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "5/19/2022 2:45:00 PM",
      "Date": "2022-05-19",
      "other_field": "third value"
    }
  ]
}
```

Output (after date normalization):

```json
{
  "results": [
    {
      "Log date": "2022-05-17 05:28:48",
      "Date": "2022-05-17",
      "other_field": "some value"
    },
    {
      "Log date": "2022-05-18 10:15:30",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "2022-05-19 14:45:00",
      "Date": "2022-05-19",
      "other_field": "third value"
    }
  ]
}
```

#### Sorting Example

Input (normalized data):

```json
{
  "results": [
    {
      "Log date": "2022-05-17 05:28:48",
      "Date": "2022-05-17",
      "other_field": "some value"
    },
    {
      "Log date": "2022-05-18 10:15:30",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "2022-05-19 14:45:00",
      "Date": "2022-05-19",
      "other_field": "third value"
    }
  ]
}
```

Output (sorted by "Log date" in descending order):

```json
{
  "results": [
    {
      "Log date": "2022-05-19 14:45:00",
      "Date": "2022-05-19",
      "other_field": "third value"
    },
    {
      "Log date": "2022-05-18 10:15:30",
      "Date": "2022-05-18",
      "other_field": "another value"
    },
    {
      "Log date": "2022-05-17 05:28:48",
      "Date": "2022-05-17",
      "other_field": "some value"
    }
  ]
}
```

These examples demonstrate how the `dateNormalizationMiddleware` normalizes the "Log date" field to a consistent format (YYYY-MM-DD HH:mm:ss), and how the `sortingMiddleware` can then sort the normalized dates based on the specified order.

Note that the "Date" field remains unchanged as it's already in a standardized format. The sorting can be applied to either the "Log date" or "Date" field, depending on the `sortby` parameter passed to the API.

#### Bulk Search Example

For bulk searches, the structure is slightly different:

##### Input (raw data from database):

```json
{
  "total": 2,
  "page": 1,
  "results": [
    {
      "login": "user1@example.com",
      "total": 2,
      "data": [
        {
          "Log date": "17.05.2022 5:28:48",
          "Date": "2022-05-17",
          "other_field": "user1 value1"
        },
        {
          "Log date": "18.05.2022 10:15:30",
          "Date": "2022-05-18",
          "other_field": "user1 value2"
        }
      ]
    },
    {
      "login": "user2@example.com",
      "total": 1,
      "data": [
        {
          "Log date": "19.05.2022 14:45:00",
          "Date": "2022-05-19",
          "other_field": "user2 value1"
        }
      ]
    }
  ]
}
```

##### Output (after normalization and sorting by "Log date" in descending order):

```json
{
  "total": 2,
  "page": 1,
  "results": [
    {
      "login": "user1@example.com",
      "total": 2,
      "data": [
        {
          "Log date": "2022-05-18 10:15:30",
          "Date": "2022-05-18",
          "other_field": "user1 value2"
        },
        {
          "Log date": "2022-05-17 05:28:48",
          "Date": "2022-05-17",
          "other_field": "user1 value1"
        }
      ]
    },
    {
      "login": "user2@example.com",
      "total": 1,
      "data": [
        {
          "Log date": "2022-05-19 14:45:00",
          "Date": "2022-05-19",
          "other_field": "user2 value1"
        }
      ]
    }
  ]
}
```

In the bulk search example, the date normalization is applied to each "Log date" field within the nested "data" arrays, and the sorting is applied to the "data" array of each result independently.

## Implementing New API Routes with Date Normalization and Sorting

To implement a new API route that includes date normalization and sorting:

1. Create a new controller function that fetches data from the database without sorting.
2. Store the fetched data in `req.searchResults`.
3. Create a new route file in `routes/api/v1/`.
4. Configure the route to use the controller function, followed by `dateNormalizationMiddleware`, `sortingMiddleware`, and `sendResponseMiddleware`.

Example:

```javascript
// newController.js
async function newSearchFunction(req, res, next) {
  // ... fetch data from database
  req.searchResults = { results: fetchedData };
  next();
}
// routes/api/v1/newSearch.js
const express = require("express");
const router = express.Router();
const { newSearchFunction } = require("../../../controllers/newController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
router.get(
  "/new-search",
  newSearchFunction,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);
```

## Handling Unrecognized Date Formats

When an unrecognized date format is encountered:

1. The original date string is returned unchanged.
2. A warning is logged.
3. The unrecognized format is logged to [`logs/new_date_formats.log`](logs/new_date_formats.log) with a guessed format.

## Adding New Date Formats

To add support for new date formats:

1. Open the `services/dateService.js` file.
2. Locate the `KNOWN_LOG_DATE_FORMATS` array.
3. Add the new format string to the array.
4. Update the `guessPossibleFormat` function to include the new format.
5. Test thoroughly with the new format added.

## Best Practices

1. Always use the `parseDate` function from `services/dateService.js` when working with dates.
2. Regularly review and update the list of known date formats.
3. Monitor the `logs/new_date_formats.log` file for new, unsupported formats.
4. When adding new date formats, ensure thorough testing across the application.
5. Consider the performance impact of adding too many date formats.

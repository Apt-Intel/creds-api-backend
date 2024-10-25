# Guide for Hardening API Endpoints: From Initial State to Final Hardened State

This guide provides a detailed step-by-step process for engineers to harden API endpoints, ensuring they are secure, efficient, and robust. By following this guide, you can transform existing endpoints from their initial state to a final hardened state, similar to the process we applied to the `v1/search-by-mail` and `v1/search-by-mail/bulk` endpoints.

## Table of Contents

1. [Introduction](#introduction)
2. [Step 1: Input Validation](#step-1-input-validation)
   - [1.1 Validate Required Parameters](#11-validate-required-parameters)
   - [1.2 Validate Parameter Formats](#12-validate-parameter-formats)
   - [1.3 Sanitize Inputs](#13-sanitize-inputs)
3. [Step 2: Database Query Safety](#step-2-database-query-safety)
   - [2.1 Use Parameterized Queries](#21-use-parameterized-queries)
   - [2.2 Ensure Query Safety](#22-ensure-query-safety)
   - [2.3 Use Query Builders](#23-use-query-builders)
   - [2.4 Consider Projections](#24-consider-projections)
4. [Step 3: Error Handling and Logging](#step-3-error-handling-and-logging)
   - [3.1 Provide Meaningful Error Messages](#31-provide-meaningful-error-messages)
   - [3.2 Use Consistent Logging](#32-use-consistent-logging)
5. [Step 4: Documenting and Planning for Future Enhancements](#step-4-documenting-and-planning-for-future-enhancements)
   - [4.1 Add TODO Comments](#41-add-todo-comments)
   - [4.2 Engage with Product Team](#42-engage-with-product-team)
6. [Step 5: Applying the Steps to Other Endpoints](#step-5-applying-the-steps-to-other-endpoints)
   - [5.1 Identify Target Endpoints](#51-identify-target-endpoints)
   - [5.2 Follow the Hardening Steps](#52-follow-the-hardening-steps)
7. [Conclusion](#conclusion)
8. [Appendix: Code Examples](#appendix-code-examples)

## Introduction

As our API evolves, it's crucial to ensure that all endpoints are secure, robust, and efficient. This guide outlines the steps to harden API endpoints by implementing input validation, ensuring database query safety, handling errors gracefully, and planning for future enhancements.

By meticulously examining and updating each endpoint, we can prevent potential security vulnerabilities, optimize performance, and improve the overall quality of our API.

## Step 1: Input Validation

Input validation is the first line of defense against invalid or malicious data. Proper validation ensures that only well-formed, expected data is processed by the API, reducing the risk of errors and security issues.

### 1.1 Validate Required Parameters

**Action**: Ensure all required parameters are present and not empty.

**Example**:

if (!mail) {
return res.status(400).json({ error: "Mail parameter is required" });
}

### 1.2 Validate Parameter Formats

**Action**: Use validation libraries (e.g., `validator.js`) to validate the format of parameters like emails, numbers, and predefined strings.

**Implementation**:

- **Email Validation**: Use `validator.isEmail(email)`.

- **Number Validation**: Check if `page` is a positive integer.

- **Enum Validation**: Ensure parameters like `type`, `sortby`, and `sortorder` have acceptable values.

**Example**:

const validTypes = ["strict", "all"];
if (!validTypes.includes(type)) {
return res.status(400).json({ error: "Invalid 'type' parameter" });
}

### 1.3 Sanitize Inputs

**Action**: Sanitize user inputs to remove or escape potentially harmful characters.

**Implementation**:

- Use `validator.escape(input)` to sanitize strings.

**Example**:

const sanitizedMail = validator.escape(mail);

## Step 2: Database Query Safety

Ensuring that database queries are safe and efficient is crucial for both security and performance.

### 2.1 Use Parameterized Queries

**Action**: Construct queries using parameters that have been validated and sanitized to prevent injection attacks.

**Example**:

const query = type === "all" ? { Emails: sanitizedMail } : { Employee: sanitizedMail };

### 2.2 Ensure Query Safety

**Action**: Avoid using user inputs directly in queries without validation and sanitization.

**Implementation**:

- Validate and sanitize all inputs before using them in queries.
- Avoid concatenating user inputs into query strings.

**Example**:

const sanitizedMail = validator.escape(mail);
// Safe to use sanitizedMail in query

### 2.3 Use Query Builders

**Action**: Use query builder methods provided by the database driver or ORM to construct queries safely.

**Implementation**:

- Use methods like `find`, `findOne`, and `countDocuments` with object parameters.

**Example**:

const results = await collection.find(query).skip(skip).limit(limit).toArray();

### 2.4 Consider Projections

**Action**: Use projections to limit the fields returned by queries, reducing data exposure and improving performance.

**Note**: Before implementing projections, discuss with the product team to identify necessary fields.

**Example**:

// TODO: Implement projection to limit returned fields
// Example:
// const projection = { \_id: 0, Emails: 1, Employee: 1, "Log date": 1, Date: 1 };
// const results = await collection.find(query).project(projection).skip(skip).limit(limit).toArray();

## Step 3: Error Handling and Logging

Proper error handling and consistent logging are essential for debugging and maintaining the API.

### 3.1 Provide Meaningful Error Messages

**Action**: Return clear and helpful error messages to the client, avoiding exposure of sensitive information.

**Implementation**:

- Use HTTP status codes appropriately (e.g., `400 Bad Request`, `500 Internal Server Error`).
- Include an `error` field in the response with a user-friendly message.
- Optionally include a `details` field for additional information.

**Example**:

return res.status(400).json({ error: "Invalid 'page' parameter" });

### 3.2 Use Consistent Logging

**Action**: Log meaningful messages at appropriate log levels (`info`, `warn`, `error`) for tracking and debugging purposes.

**Implementation**:

- Include relevant context in log messages (e.g., parameters, processing times).
- Use the established logging system (e.g., `winston`) configured in the project.

**Example**:

logger.info(`Search initiated for mail: ${mail}, page: ${page}`);

## Step 4: Documenting and Planning for Future Enhancements

Documentation and planning are key for future maintenance and enhancements.

### 4.1 Add TODO Comments

**Action**: Add TODO comments in code to highlight areas for future improvement or discussion.

**Implementation**:

- Clearly state the purpose of the TODO and any next steps.
- Ensure the comments are concise and informative.

**Example**:

// TODO: Implement projection to limit returned fields
// Discuss with the product team to determine which fields are necessary

### 4.2 Engage with Product Team

**Action**: Collaborate with the product team to understand requirements and the impact of changes.

**Implementation**:

- Schedule meetings or discussions to align on features like data projection.
- Document decisions and update code/comments accordingly.

## Step 5: Applying the Steps to Other Endpoints

Now that we've outlined the hardening steps, let's apply them to other endpoints in a systematic way.

### 5.1 Identify Target Endpoints

**Action**: List all endpoints that need hardening.

**Implementation**:

- Review the codebase to identify endpoints, such as:
  - `v1/search-by-domain`
  - `v1/search-by-domain/bulk`
  - `internal/search-by-login`
  - `internal/search-by-login/bulk`

### 5.2 Follow the Hardening Steps

For each endpoint:

1. **Input Validation**

   - Identify all parameters (query, body, headers).
   - Validate required parameters are present.
   - Validate parameter formats using appropriate validation methods.
   - Sanitize inputs before using them.

2. **Database Query Safety**

   - Use parameterized queries with validated and sanitized inputs.
   - Ensure queries are constructed safely, avoiding injection risks.
   - Use query builders provided by the database driver or ORM.

3. **Error Handling and Logging**

   - Provide clear error messages for invalid inputs.
   - Use appropriate HTTP status codes.
   - Log informative messages with relevant context.

4. **Documenting and Planning**

   - Add TODO comments for future enhancements (e.g., projections, indexing).
   - Engage with the product team for any changes that may impact functionality or data returned.

**Example for `v1/search-by-domain` Controller**:

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const validator = require("validator");

async function searchByDomain(req, res, next) {
  const domain = req.body.domain || req.query.domain;
  const page = parseInt(req.query.page, 10);
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Search initiated for domain: ${domain}, page: ${page}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  // Validate 'domain' parameter
  if (!domain || !validator.isFQDN(domain)) {
    return res
      .status(400)
      .json({ error: "Valid domain parameter is required" });
  }

  // Sanitize 'domain' parameter
  const sanitizedDomain = validator.escape(domain);

  // Validate 'page' parameter
  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: "Invalid 'page' parameter" });
  }

  // Validate 'type' parameter
  const validTypes = ["strict", "all"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid 'type' parameter" });
  }

  // Validate 'sortby' parameter
  const validSortBy = ["date_compromised", "date_uploaded"];
  if (!validSortBy.includes(sortby)) {
    return res.status(400).json({ error: "Invalid 'sortby' parameter" });
  }

  // Validate 'sortorder' parameter
  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortorder)) {
    return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection("logs");

    // Use parameterized query
    const query =
      type === "all"
        ? { Domains: sanitizedDomain }
        : { Employee: { $regex: `@${sanitizedDomain}$`, $options: "i" } };
    const { limit, skip } = getPaginationParams(page);

    // TODO: Implement projection to limit returned fields
    // Discuss with the product team to determine which fields are necessary

    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    const response = {
      total,
      page,
      results,
    };

    logger.info(
      `Search completed for domain: ${domain}, total results: ${total}`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByDomain:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByDomain,
};
```

## Conclusion

By following this step-by-step guide, engineers can systematically harden API endpoints, ensuring they are secure, efficient, and maintainable. The process involves thorough input validation, safe database querying, proper error handling, consistent logging, and planning for future enhancements.

Applying these practices across all endpoints will significantly improve the robustness and reliability of the API, providing a better experience for both developers and users.

## Appendix: Code Examples

For convenience, here are the hardened versions of the `v1/search-by-mail` and `v1/search-by-mail/bulk` controllers, which can serve as references when hardening other endpoints.

### Hardened `v1/search-by-mail` Controller

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const validator = require("validator");

async function searchByMail(req, res, next) {
  const mail = req.body.mail || req.query.mail;
  const page = parseInt(req.query.page, 10);
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Search initiated for mail: ${mail}, page: ${page}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  // Validate 'mail' parameter
  if (!mail || !validator.isEmail(mail)) {
    return res.status(400).json({ error: "Valid mail parameter is required" });
  }

  // Sanitize 'mail' parameter
  const sanitizedMail = validator.escape(mail);

  // Validate 'page' parameter
  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: "Invalid 'page' parameter" });
  }

  // Validate 'type' parameter
  const validTypes = ["strict", "all"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid 'type' parameter" });
  }

  // Validate 'sortby' parameter
  const validSortBy = ["date_compromised", "date_uploaded"];
  if (!validSortBy.includes(sortby)) {
    return res.status(400).json({ error: "Invalid 'sortby' parameter" });
  }

  // Validate 'sortorder' parameter
  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortorder)) {
    return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection("logs");

    // Use parameterized query
    const query =
      type === "all" ? { Emails: sanitizedMail } : { Employee: sanitizedMail };
    const { limit, skip } = getPaginationParams(page);

    // TODO: Implement projection to limit returned fields
    // Discuss with the product team to determine which fields are necessary

    const [results, total] = await Promise.all([
      collection.find(query).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    const response = {
      total,
      page,
      results,
    };

    logger.info(`Search completed for mail: ${mail}, total results: ${total}`);

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMail:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByMail,
};
```

### Hardened `v1/search-by-mail/bulk` Controller

```js
const { getDatabase } = require("../../config/database");
const logger = require("../../config/logger");
const { getPaginationParams } = require("../../utils/paginationUtils");
const { performance } = require("perf_hooks");
const validator = require("validator");

async function searchByMailBulk(req, res, next) {
  const startTime = performance.now();
  const { mails } = req.body;
  const page = parseInt(req.query.page, 10);
  const type = req.query.type || "strict";
  const sortby = req.query.sortby || "date_compromised";
  const sortorder = req.query.sortorder || "desc";

  logger.info(
    `Bulk search request received for ${mails.length} mails, page: ${page}, type: ${type}, sortby: ${sortby}, sortorder: ${sortorder}`
  );

  // Validate 'mails' parameter
  if (!Array.isArray(mails) || mails.length === 0 || mails.length > 10) {
    logger.warn("Invalid input: mails array", { mailCount: mails.length });
    return res.status(400).json({
      error: "Invalid mails array. Must contain 1-10 email addresses.",
    });
  }

  // Validate each email in the 'mails' array
  const invalidEmails = mails.filter((email) => !validator.isEmail(email));
  if (invalidEmails.length > 0) {
    return res.status(400).json({
      error: "Invalid email formats",
      invalidEmails,
    });
  }

  // Sanitize each email in the 'mails' array
  const sanitizedMails = mails.map((email) => validator.escape(email));

  // Validate 'page' parameter
  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: "Invalid 'page' parameter" });
  }

  // Validate 'type' parameter
  const validTypes = ["strict", "all"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid 'type' parameter" });
  }

  // Validate 'sortby' parameter
  const validSortBy = ["date_compromised", "date_uploaded"];
  if (!validSortBy.includes(sortby)) {
    return res.status(400).json({ error: "Invalid 'sortby' parameter" });
  }

  // Validate 'sortorder' parameter
  const validSortOrder = ["asc", "desc"];
  if (!validSortOrder.includes(sortorder)) {
    return res.status(400).json({ error: "Invalid 'sortorder' parameter" });
  }

  try {
    const db = await getDatabase();
    const collection = db.collection("logs");

    const searchPromises = sanitizedMails.map(async (mail) => {
      // Use parameterized query
      const query = type === "all" ? { Emails: mail } : { Employee: mail };
      const { limit, skip } = getPaginationParams(page);

      // TODO: Implement projection to limit returned fields
      // Discuss with the product team to determine which fields are necessary

      const [results, total] = await Promise.all([
        collection.find(query).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      return {
        mail,
        total,
        data: results,
      };
    });

    const searchResults = await Promise.all(searchPromises);

    const totalResults = searchResults.reduce(
      (sum, result) => sum + result.total,
      0
    );
    const response = {
      total: totalResults,
      page,
      results: searchResults,
    };

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    logger.info(
      `Bulk search completed for ${
        mails.length
      } mails, total results: ${totalResults}, processing time: ${totalTime.toFixed(
        2
      )}ms`
    );

    req.searchResults = response;
    next();
  } catch (error) {
    logger.error("Error in searchByMailBulk:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

module.exports = {
  searchByMailBulk,
};
```

By using this guide and the examples provided, you should be well-equipped to harden other endpoints in the API, enhancing the security and reliability of our application.

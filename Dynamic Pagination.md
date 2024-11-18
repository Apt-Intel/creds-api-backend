# Implementation Plan: Allow Clients to Specify Page Size in API Responses

**Objective:** Implement the ability for clients to specify the page size in API responses to reduce the load on the frontend, without breaking or changing any other functionality or code design.

---

## Overview

We will introduce a new optional query parameter `page_size` to allow clients to specify the number of results returned per page within predefined limits. This implementation must:

- Be consistent across all paginated endpoints.
- Include proper validation to prevent misuse.
- Maintain backward compatibility.
- Not introduce breaking changes to existing functionality.
- Be thoroughly tested.

---

## Step-by-Step Implementation Plan

### **Step 1: Identify All Affected Components**

#### **1.1. Routes and Controllers Using Pagination**

Based on the codebase, the following routes and their corresponding controllers use pagination:

- **V1 API Routes:**
  - `routes/api/v1/searchByMail.js`
  - `routes/api/v1/searchByMailBulk.js`
  - `routes/api/v1/searchByDomain.js`
  - `routes/api/v1/searchByDomainBulk.js`
- **Internal API Routes:**
  - `routes/api/internal/searchByLogin.js`
  - `routes/api/internal/searchByLoginBulk.js`
  - `routes/api/internal/searchByDomain.js`
  - `routes/api/internal/searchByDomainBulk.js`
- **Controllers:**
  - `controllers/v1/mailController.js`
  - `controllers/v1/mailBulkController.js`
  - `controllers/v1/domainController.js`
  - `controllers/v1/domainBulkController.js`
  - `controllers/internal/loginController.js`
  - `controllers/internal/loginBulkController.js`
  - `controllers/internal/domainController.js`
  - `controllers/internal/domainBulkController.js`

#### **1.2. Utility Functions and Middlewares**

- **Pagination Utility:**
  - `utils/paginationUtils.js`
- **Middlewares (if any) that handle pagination parameters**

---

### **Step 2: Define Constants for Page Size Limits**

To prevent misuse, we need to define minimum and maximum limits for `page_size`.

- **Minimum Page Size (`MIN_PAGE_SIZE`):** 1 (to allow clients to request at least one result)
- **Maximum Page Size (`MAX_PAGE_SIZE`):** 50 (current default page size)

Add these constants to a configuration file or the existing `config/constants.js` if available.

```js
// config/constants.js
module.exports = {
  DEFAULT_PAGE_SIZE: 50,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 50,
  // ... other constants
};
```

**Potential Pitfall:** Without enforcing limits, clients might request excessively large page sizes, impacting performance.

---

### **Step 3: Update the Pagination Utility Function**

Modify the `getPaginationParams` function in `utils/paginationUtils.js` to accept `pageSize` and enforce the defined limits.

```js
// utils/paginationUtils.js
const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../config/constants");

function getPaginationParams(page, pageSize = DEFAULT_PAGE_SIZE) {
  const limit = Math.min(Math.max(pageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;
  return { limit, skip };
}

module.exports = {
  getPaginationParams,
};
```

**Explanation:**

- `Math.max(pageSize, MIN_PAGE_SIZE)`: Ensures `pageSize` is not less than `MIN_PAGE_SIZE`.
- `Math.min(..., MAX_PAGE_SIZE)`: Ensures `pageSize` does not exceed `MAX_PAGE_SIZE`.

**Potential Pitfall:** Without enforcing limits, clients might request excessively large page sizes, impacting performance.

---

### **Step 4: Update Controllers to Accept and Validate `page_size`**

For each controller that handles pagination:

#### **4.1. Parse `page_size` from the Request**

In the controller function, extract `page_size` from the query parameters.

```js
// Example from a controller
const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../../config/constants");

const page = parseInt(req.query.page, 10) || 1;
const pageSize = parseInt(req.query.page_size, 10) || DEFAULT_PAGE_SIZE;
```

**Potential Pitfall:** If `page_size` is not a valid integer, `parseInt` may return `NaN`. Use default in such cases.

#### **4.2. Validate `page_size`**

Add validation to ensure `page_size` is a number within the allowed range.

```js
if (isNaN(pageSize) || pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE) {
  return res.status(400).json({
    error: `Invalid 'page_size' parameter. Must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}.`,
  });
}
```

**Potential Pitfall:** Without validation, invalid `page_size` values could cause errors or unexpected behavior.

#### **4.3. Update Pagination Parameters**

Pass the validated `pageSize` to the `getPaginationParams` function.

```js
const { limit, skip } = getPaginationParams(page, pageSize);
```

#### **4.4. Ensure Consistency Across All Controllers**

Repeat steps 4.1 to 4.3 for all controllers that use pagination.

---

### **Step 5: Update Response Structure (If Necessary)**

Include `page_size` in the API responses to provide clients with context.

```js
const response = {
  total,
  page,
  page_size: limit, // The actual limit used
  results,
};
```

**Note:** This maintains transparency and helps clients understand how many results are returned.

---

### **Step 6: Update API Documentation**

Revise the API documentation to include the new `page_size` parameter for all relevant endpoints.

#### **6.1. Document the Parameter**

- **Parameter:** `page_size`
- **Type:** Integer
- **Required:** No
- **Description:** Number of results per page. Must be between `1` and `50`. Default is `50`.

#### **6.2. Update Endpoint Documentation**

For each endpoint:

- Add `page_size` to the list of query parameters.
- Provide examples of usage.
- Specify the default value and limits.

**Potential Pitfall:** Clients may be unaware of the new parameter unless documentation is updated promptly.

---

### **Step 7: Update Unit and Integration Tests**

#### **7.1. Identify Test Files**

Test files that may require updates:

- `__tests__/loginController.test.js`
- `__tests__/dateService.test.js`
- `__tests__/documentRedesignDomainMiddleware.test.js`
- Any other tests related to pagination.

#### **7.2. Add Test Cases**

- Test with valid `page_size` values within the allowed range.
- Test with invalid `page_size` values (e.g., non-integer, out of range).
- Ensure that responses include the correct number of results.
- Test default behavior when `page_size` is not provided.

**Potential Pitfall:** Failing to update tests may result in undetected bugs or broken tests.

---

### **Step 8: Review and Update Middlewares (If Necessary)**

Although pagination is typically handled in controllers, review any middlewares that might be affected.

- **Middlewares to Check:**
  - `middlewares/complexRateLimitMiddleware.js`
  - `middlewares/requestLogger.js`

**Action:**

- Ensure that logging includes the `page_size` parameter, if relevant.
- Confirm that rate limiting is not adversely affected by changes in page size.

---

### **Step 9: Ensure Backward Compatibility**

- **Default Behavior:** When `page_size` is not specified, the API should default to the current behavior (50 results per page).
- **Existing Clients:** Clients that do not use the `page_size` parameter should experience no change.

**Potential Pitfall:** Changes that alter default behaviors can break existing client integrations.

---

### **Step 10: Update Related Documentation Files**

In addition to API documentation, update any other relevant documentation.

- **Files to Update:**
  - `Docs/API Documentation.md`
  - `Docs/API Endpoints Implementation.md`
  - `Docs/Date Handling, Normalization, and Sorting.md` (if pagination details are included)
  - `Docs/Writing Tests.md`

**Action:**

- Provide detailed explanations and examples of the new parameter.
- Update diagrams or flowcharts if they include pagination logic.

---

### **Step 11: Code Review and Quality Assurance**

Before deploying, conduct thorough code reviews.

#### **11.1. Code Review Checklist**

- **Consistency:** Ensure all controllers handle `page_size` consistently.
- **Validation:** Confirm that validation logic is robust and handles edge cases.
- **Error Handling:** Verify that meaningful error messages are returned for invalid inputs.
- **Security:** Check for any security implications (e.g., DoS attacks due to large `page_size` values).
- **Performance:** Assess any performance impact due to changes.

#### **11.2. Testing in Different Environments**

- **Development Environment:** Initial testing and debugging.
- **Staging Environment:** Simulation of production environment for final validation.

**Potential Pitfall:** Skipping thorough testing can result in bugs reaching production.

---

### **Step 12: Deployment Plan**

Prepare a deployment plan that includes:

- **Scheduled Deployment Time:** Choose a low-traffic period to minimize impact.
- **Rollback Strategy:** Have a plan in place to revert changes if necessary.
- **Monitoring:** Monitor the application after deployment for any anomalies.

**Potential Pitfall:** Deploying without a rollback plan can extend downtime if issues arise.

---

### **Step 13: Communication with Clients**

Notify clients about the new optional parameter.

#### **13.1. Draft Client Communication**

- Explain the purpose of the `page_size` parameter.
- Provide guidelines on how to use it effectively.
- Include examples and best practices.

#### **13.2. Update Client-Facing Materials**

- **Client Integration Guides**
- **FAQs**
- **Support Documentation**

---

### **Step 14: Monitor Usage and Performance**

After deployment:

- **Monitor API Usage:**
  - Track how clients are using the `page_size` parameter.
  - Identify any misuse or irregular patterns.
- **Assess Impact:**
  - Evaluate whether frontend performance has improved.
  - Monitor server performance and resource utilization.

**Potential Pitfall:** Not monitoring may lead to unnoticed issues affecting system performance.

---

### **Step 15: Iterative Improvements**

Based on monitoring results and client feedback:

- **Adjust Limits:** If necessary, adjust `MIN_PAGE_SIZE` and `MAX_PAGE_SIZE`.
- **Optimize Queries:** If larger page sizes impact performance, consider optimizing database queries or indexing.
- **Enhance Documentation:** Reflect any changes or additional tips in the documentation.

---

## Potential Challenges and Mitigation Strategies

### **Challenge 1: Clients Requesting Maximum Allowed Page Size**

- **Impact:** Increased server load and bandwidth usage.
- **Mitigation:**
  - Carefully set `MAX_PAGE_SIZE` based on server capacity.
  - Monitor usage patterns to identify and address abuse.
  - Consider dynamic rate limiting based on `page_size`.

### **Challenge 2: Invalid `page_size` Causing Errors**

- **Impact:** Application errors, potential crashes.
- **Mitigation:**
  - Implement robust input validation.
  - Use try-catch blocks to handle unexpected errors gracefully.
  - Return informative error messages to guide clients.

### **Challenge 3: Inconsistent Implementation Across Endpoints**

- **Impact:** Confusion for clients, maintenance difficulties.
- **Mitigation:**
  - Standardize the implementation by possibly creating a middleware for pagination parameters.
  - Ensure all controllers use the updated `getPaginationParams` function.

### **Challenge 4: Potential Security Vulnerabilities**

- **Impact:** Exposure to DoS attacks by requesting large datasets.
- **Mitigation:**
  - Enforce strict limits on `page_size`.
  - Monitor and throttle requests that appear malicious.
  - Employ rate limiting per client.

### **Challenge 5: Overlooking Updates in Some Controllers or Tests**

- **Impact:** Functionality may break in certain endpoints.
- **Mitigation:**
  - Use codebase-wide search for pagination usage.
  - Conduct comprehensive testing of all endpoints.
  - Keep a checklist of all files to update.

---

## Conclusion

By methodically implementing the ability for clients to specify `page_size`, we can effectively reduce the load on the frontend application and improve overall user experience. This plan ensures that:

- All relevant components are updated consistently.
- Proper validation and error handling are in place.
- Existing functionality remains unaffected.
- Potential issues are anticipated and mitigated.

Implementing this single change (Option 1) provides immediate benefits without the complexity of additional features, aligning with the immediate needs and constraints outlined.

---

# Summary

We have developed a comprehensive plan to allow clients to specify the page size in API responses. This plan carefully considers all aspects of implementation, potential challenges, and ensures that no existing functionality or code design is broken in the process. By following this step-by-step guide, the development team can proceed confidently, knowing that they are addressing the problem effectively and efficiently.

---

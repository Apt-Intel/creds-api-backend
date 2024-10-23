# API Documentation

## 1. Search by Login

### Endpoint

`GET /api/json/v1/search-by-login`
`POST /api/json/v1/search-by-login`

### Description

Search for user login information based on query parameters or request body.

### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `login`              | String  | Yes      | The login username to search for.                                              |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: 1                                     |
| `installed_software` | Boolean | No       | Filter by installed software. Default: false                                   |

### Example Request

GET /api/json/v1/search-by-login?login=example@email.com&sortby=date_uploaded&sortorder=asc&page=1

### Example Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Usernames": "example@email.com",
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z"
      // Other fields...
    }
    // More results...
  ]
}
```

### Errors

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Login parameter is required |
| 401         | Unauthorized - Invalid or missing API key |
| 429         | Too Many Requests - Rate limit exceeded   |
| 500         | Internal Server Error                     |

## 2. Search by Login (Bulk)

### Endpoint

`POST /api/json/v1/search-by-login/bulk`

### Description

Search for multiple user logins in a single request.

### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: 1                                     |
| `installed_software` | Boolean | No       | Filter by installed software. Default: false                                   |

### Request Body

| Parameter | Type     | Required | Description                                           |
| --------- | -------- | -------- | ----------------------------------------------------- |
| `logins`  | String[] | Yes      | Array of login usernames to search for (max 10 items) |

### Example Request

POST /api/json/v1/search-by-login/bulk?sortby=date_uploaded&sortorder=asc&page=1

```json
{
  "logins": ["example1@email.com", "example2@email.com"]
}
```

### Example Response

```json
{
  "total": 150,
  "page": 1,
  "results": [
    {
      "login": "example1@email.com",
      "total": 100,
      "data": [
        {
          "Usernames": "example1@email.com",
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z"
          // Other fields...
        }
        // More results...
      ]
    },
    {
      "login": "example2@email.com",
      "total": 50,
      "data": [
        {
          "Usernames": "example2@email.com",
          "Log date": "2023-07-24T10:15:45.000Z",
          "Date": "2023-07-24T10:15:45.000Z"
          // Other fields...
        }
        // More results...
      ]
    }
  ]
}
```

### Errors

| Status Code | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| 400         | Bad Request - Invalid logins array or exceeds maximum limit |
| 401         | Unauthorized - Invalid or missing API key                   |
| 429         | Too Many Requests - Rate limit exceeded                     |
| 500         | Internal Server Error                                       |

## 3. Test Date Normalization

### Endpoint

`GET /api/json/v1/test-date-normalization`

### Description

Test endpoint to verify date normalization functionality.

### Example Response

```json
{
  "testLogDate1": "2022-05-17T05:28:48.000Z",
  "testLogDate2": "2022-05-17T05:28:48.375Z",
  "testLogDate3": "2022-05-17T05:28:48.000Z",
  "Date": "2023-10-21 14:30:00",
  "nonDateField": "This is not a date"
}
```

## 4. Internal Search by Login

### Endpoint

`GET /api/json/internal/search-by-login`
`POST /api/json/internal/search-by-login`

### Description

Internal endpoint for searching user login information. This endpoint mirrors the functionality of the v1 endpoint but is intended for internal use only.

### Request Parameters

(Same as the v1 endpoint)

### Example Request

GET /api/json/internal/search-by-login?login=example@email.com&sortby=date_uploaded&sortorder=asc&page=1

### Example Response

(Same format as the v1 endpoint)

## 5. Internal Search by Login (Bulk)

### Endpoint

`POST /api/json/internal/search-by-login/bulk`

### Description

Internal endpoint for bulk searching of user logins. This endpoint mirrors the functionality of the v1 bulk endpoint but is intended for internal use only.

### Request Parameters

(Same as the v1 bulk endpoint)

### Request Body

(Same as the v1 bulk endpoint)

### Example Request

POST /api/json/internal/search-by-login/bulk?sortby=date_uploaded&sortorder=asc&page=1

### Example Response

(Same format as the v1 bulk endpoint)

## Authentication

All endpoints (except `/health`) require an API key to be provided in the request headers.

### Header

api-key: YOUR_API_KEY

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 50 requests per 10-second window

Rate limit information is provided in the response headers:

`X-RateLimit-Limit: 50`
`X-RateLimit-Remaining: 49`
`X-RateLimit-Reset: 9`

## Pagination

Results are paginated with a default page size of 50 items. Use the `page` query parameter to navigate through pages.

## Date Normalization

The API automatically normalizes dates in the "Log date" field to ISO 8601 format (UTC) for consistency.

## Error Responses

Error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

## Health Check

### Endpoint

`GET /health`

### Description

Check the health status of the API.

### Example Response

```json
{
  "status": "OK"
}
```

This endpoint does not require authentication and is not subject to rate limiting.

## Note on Internal Endpoints

The `/api/json/internal` endpoints have been created to separate internal usage from consumer-facing endpoints. While they currently mirror the functionality of the `/api/json/v1` endpoints, they may be modified independently in the future to better suit internal needs without affecting the public API contract.

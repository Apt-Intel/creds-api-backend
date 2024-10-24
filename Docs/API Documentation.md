# API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Pagination](#pagination)
4. [Date Normalization](#date-normalization)
5. [Error Responses](#error-responses)
6. [Health Check](#health-check)
7. [Endpoints](#endpoints)
   - [Search by Mail](#1-search-by-mail)
   - [Search by Mail (Bulk)](#2-search-by-mail-bulk)
   - [Search by Domain](#3-search-by-domain)
   - [Search by Domain (Bulk)](#4-search-by-domain-bulk)
   - [Test Date Normalization](#5-test-date-normalization)
8. [Internal Endpoints](#internal-endpoints)
   - [Internal Search by Mail](#6-internal-search-by-mail)
   - [Internal Search by Mail (Bulk)](#7-internal-search-by-mail-bulk)
   - [Internal Search by Domain](#8-internal-search-by-domain)
   - [Internal Search by Domain (Bulk)](#9-internal-search-by-domain-bulk)
9. [Document Redesign Process](#document-redesign-process)
10. [Note on Internal Endpoints](#note-on-internal-endpoints)

---

## Authentication

All endpoints (except `/health`) require an API key to be provided in the request headers.

### Header

- `api-key: YOUR_API_KEY`

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- **50 requests per 10-second window**

Rate limit information is provided in the response headers:

- `X-RateLimit-Limit: 50`
- `X-RateLimit-Remaining: 49`
- `X-RateLimit-Reset: 9`

## Pagination

Results are paginated with a default page size of **50 items**. Use the `page` query parameter to navigate through pages.

## Date Normalization

The API automatically normalizes dates in the `"Log date"` field to **ISO 8601** format (**UTC**) for consistency.

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

- `GET /health`

### Description

Check the health status of the API.

### Example Response

```json
{
  "status": "OK"
}
```

This endpoint does not require authentication and is not subject to rate limiting.

---

## Endpoints

### 1. Search by Mail

#### Endpoint

- `GET /api/json/v1/search-by-mail`
- `POST /api/json/v1/search-by-mail`

#### Description

Search for user mail information based on query parameters or request body.

#### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `mail`               | String  | Yes      | The mail address to search for.                                                |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

#### Example Request

`GET /api/json/v1/search-by-mail?mail=example@email.com&sortby=date_uploaded&sortorder=asc&page=1&type=all`

#### Example Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Usernames": "example@email.com",
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ],
      "ExternalCredentials": [
        {
          "URL": "https://othersite.com",
          "Username": "user@example.com",
          "Password": "password456"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "user@thirdsite.com",
          "Password": "password789"
        }
      ]
      // Other fields...
    }
    // More results...
  ]
}
```

#### Errors

| Status Code | Description                               |
| ----------- | ----------------------------------------- |
| 400         | Bad Request - Mail parameter is required  |
| 401         | Unauthorized - Invalid or missing API key |
| 429         | Too Many Requests - Rate limit exceeded   |
| 500         | Internal Server Error                     |

### 2. Search by Mail (Bulk)

#### Endpoint

- `POST /api/json/v1/search-by-mail/bulk`

#### Description

Search for multiple user mails in a single request.

#### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

#### Request Body

| Parameter | Type     | Required | Description                                          |
| --------- | -------- | -------- | ---------------------------------------------------- |
| `mails`   | String[] | Yes      | Array of mail addresses to search for (max 10 items) |

#### Example Request

`POST /api/json/v1/search-by-mail/bulk?sortby=date_uploaded&sortorder=asc&page=1&type=all`

```json
{
  "mails": ["example1@email.com", "example2@email.com"]
}
```

#### Example Response

```json
{
  "total": 150,
  "page": 1,
  "results": [
    {
      "mail": "example1@email.com",
      "total": 100,
      "data": [
        {
          "Usernames": "example1@email.com",
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example.com",
              "Username": "user@example.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    },
    {
      "mail": "example2@email.com",
      "total": 50,
      "data": [
        {
          "Usernames": "example2@email.com",
          "Log date": "2023-07-24T10:15:45.000Z",
          "Date": "2023-07-24T10:15:45.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example.com",
              "Username": "user@example.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    }
  ]
}
```

#### Errors

| Status Code | Description                                                |
| ----------- | ---------------------------------------------------------- |
| 400         | Bad Request - Invalid mails array or exceeds maximum limit |
| 401         | Unauthorized - Invalid or missing API key                  |
| 429         | Too Many Requests - Rate limit exceeded                    |
| 500         | Internal Server Error                                      |

### 3. Search by Domain

#### Endpoint

- `GET /api/json/v1/search-by-domain`
- `POST /api/json/v1/search-by-domain`

#### Description

Search for domain information based on query parameters or request body.

#### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `domain`             | String  | Yes      | The domain to search for.                                                      |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

#### Example Request

`GET /api/json/v1/search-by-domain?domain=example.com&sortby=date_uploaded&sortorder=asc&page=1&type=all`

#### Example Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ],
      "ExternalCredentials": [
        {
          "URL": "https://othersite.com",
          "Username": "user@example.com",
          "Password": "password456"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "user@thirdsite.com",
          "Password": "password789"
        }
      ]
      // Other fields...
    }
    // More results...
  ]
}
```

#### Errors

| Status Code | Description                                |
| ----------- | ------------------------------------------ |
| 400         | Bad Request - Domain parameter is required |
| 401         | Unauthorized - Invalid or missing API key  |
| 429         | Too Many Requests - Rate limit exceeded    |
| 500         | Internal Server Error                      |

### 4. Search by Domain (Bulk)

#### Endpoint

- `POST /api/json/v1/search-by-domain/bulk`

#### Description

Search for multiple domains in a single request.

#### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |
| `type`               | String  | No       | Search type: `"strict"` (default) or `"all"`.                                  |
|                      |         |          | - `"strict"`: Searches in the `"Employee"` array.                              |
|                      |         |          | - `"all"`: Searches in the `"Emails"` array.                                   |

#### Request Body

| Parameter | Type     | Required | Description                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| `domains` | String[] | Yes      | Array of domains to search for (max 10 items) |

#### Example Request

`POST /api/json/v1/search-by-domain/bulk?sortby=date_uploaded&sortorder=asc&page=1&type=all`

```json
{
  "domains": ["example1.com", "example2.com"]
}
```

#### Example Response

```json
{
  "total": 150,
  "page": 1,
  "results": [
    {
      "domain": "example1.com",
      "total": 100,
      "data": [
        {
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example1.com",
              "Username": "user@example1.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example1.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    },
    {
      "domain": "example2.com",
      "total": 50,
      "data": [
        {
          "Log date": "2023-07-24T10:15:45.000Z",
          "Date": "2023-07-24T10:15:45.000Z",
          "InternalCredentials": [
            {
              "URL": "https://example2.com",
              "Username": "user@example2.com",
              "Password": "password123"
            }
          ],
          "ExternalCredentials": [
            {
              "URL": "https://othersite.com",
              "Username": "user@example2.com",
              "Password": "password456"
            }
          ],
          "OtherCredentials": [
            {
              "URL": "https://thirdsite.com",
              "Username": "user@thirdsite.com",
              "Password": "password789"
            }
          ]
          // Other fields...
        }
        // More results...
      ]
    }
  ]
}
```

#### Errors

| Status Code | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| 400         | Bad Request - Invalid domains array or exceeds maximum limit |
| 401         | Unauthorized - Invalid or missing API key                    |
| 429         | Too Many Requests - Rate limit exceeded                      |
| 500         | Internal Server Error                                        |

### 5. Test Date Normalization

#### Endpoint

- `GET /api/json/v1/test-date-normalization`

#### Description

Test endpoint to verify date normalization functionality.

#### Example Response

```json
{
  "testLogDate1": "2022-05-17T05:28:48.000Z",
  "testLogDate2": "2022-05-17T05:28:48.375Z",
  "testLogDate3": "2022-05-17T05:28:48.000Z",
  "Date": "2023-10-21 14:30:00",
  "nonDateField": "This is not a date"
}
```

---

## Internal Endpoints

### 6. Internal Search by Mail

#### Endpoint

- `GET /api/json/internal/search-by-mail`
- `POST /api/json/internal/search-by-mail`

#### Description

Internal endpoint for searching user mail information. This endpoint mirrors the functionality of the v1 endpoint but is intended for internal use only.

#### Request Parameters

(Same as the `/api/json/v1/search-by-mail` endpoint)

#### Example Request

`GET /api/json/internal/search-by-mail?mail=example@email.com&sortby=date_uploaded&sortorder=asc&page=1`

#### Example Response

(Same format as the `/api/json/v1/search-by-mail` endpoint)

### 7. Internal Search by Mail (Bulk)

#### Endpoint

- `POST /api/json/internal/search-by-mail/bulk`

#### Description

Internal endpoint for bulk searching of user mails. This endpoint mirrors the functionality of the v1 bulk endpoint but is intended for internal use only.

#### Request Parameters

(Same as the `/api/json/v1/search-by-mail/bulk` endpoint)

#### Request Body

(Same as the `/api/json/v1/search-by-mail/bulk` endpoint)

#### Example Request

`POST /api/json/internal/search-by-mail/bulk?sortby=date_uploaded&sortorder=asc&page=1`

#### Example Response

(Same format as the `/api/json/v1/search-by-mail/bulk` endpoint)

### 8. Internal Search by Domain

#### Endpoint

- `GET /api/json/internal/search-by-domain`
- `POST /api/json/internal/search-by-domain`

#### Description

Internal endpoint for searching domain information. Intended for internal use only.

#### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `domain`             | String  | Yes      | The domain to search for.                                                      |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |

#### Example Request

`GET /api/json/internal/search-by-domain?domain=example.com&sortby=date_uploaded&sortorder=asc&page=1`

#### Example Response

(Similar format as the `/api/json/v1/search-by-domain` endpoint)

### 9. Internal Search by Domain (Bulk)

#### Endpoint

- `POST /api/json/internal/search-by-domain/bulk`

#### Description

Internal endpoint for bulk searching of domains. Intended for internal use only.

#### Request Parameters

| Parameter            | Type    | Required | Description                                                                    |
| -------------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `sortby`             | String  | No       | The field to sort by. Options: `date_compromised` (default) or `date_uploaded` |
| `sortorder`          | String  | No       | The sort order (`asc` or `desc`). Default: `desc`                              |
| `page`               | Number  | No       | The page number for pagination. Default: `1`                                   |
| `installed_software` | Boolean | No       | Filter by installed software. Default: `false`                                 |

#### Request Body

| Parameter | Type     | Required | Description                                   |
| --------- | -------- | -------- | --------------------------------------------- |
| `domains` | String[] | Yes      | Array of domains to search for (max 10 items) |

#### Example Request

`POST /api/json/internal/search-by-domain/bulk?sortby=date_uploaded&sortorder=asc&page=1`

```json
{
  "domains": ["example1.com", "example2.com"]
}
```

#### Example Response

(Similar format as the `/api/json/v1/search-by-domain/bulk` endpoint)

---

## Document Redesign Process

Both single and bulk search responses go through a document redesign process:

1. **Removed Fields**:

   - `Folder Name`
   - `Build ID`
   - `Hash`
   - `Usernames`
   - `Domains`
   - `Emails`
   - `Employee`

2. **Credential Categorization**:

   - `InternalCredentials`: Credentials where the searched email's domain matches the domain in `Credentials.URL`.
   - `ExternalCredentials`: Credentials where the searched email's domain matches the domain in `Credentials.Username`.
   - `OtherCredentials`: All remaining credentials.

3. **Field Retention**:

   - All other fields from the original document are retained.

### Example Redesigned Response

```json
{
  "total": 100,
  "page": 1,
  "results": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "InternalCredentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ],
      "ExternalCredentials": [
        {
          "URL": "https://othersite.com",
          "Username": "user@example.com",
          "Password": "password456"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "user@thirdsite.com",
          "Password": "password789"
        }
      ]
      // Other fields...
    }
    // More results...
  ]
}
```

These changes implement the new document redesign feature for the `/search-by-mail` and `/search-by-mail/bulk` routes. The new middleware processes the documents after sorting and before sending the response.

---

## Note on Internal Endpoints

The `/api/json/internal` endpoints have been created to separate internal usage from consumer-facing endpoints. While they currently mirror the functionality of the `/api/json/v1` endpoints, they may be modified independently in the future to better suit internal needs without affecting the public API contract.

Please ensure that you have the appropriate permissions and authentication to access these internal endpoints.

---

Remember to test these endpoints thoroughly, especially with various edge cases in the `Credentials` array, to ensure everything works as expected.

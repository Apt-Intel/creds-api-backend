### API Documentation

#### Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Pagination](#pagination)
4. [Date Normalization](#date-normalization)
5. [Error Responses](#error-responses)
6. [Health Check](#health-check)
7. [V1 Routes](#v1-routes)
   - [Search by Mail](#search-by-mail)
   - [Search by Mail Bulk](#search-by-mail-bulk)
   - [Search by Domain](#search-by-domain)
   - [Search by Domain Bulk](#search-by-domain-bulk)
8. [Internal Routes](#internal-routes)
   - [Search by Login](#search-by-login)
   - [Search by Login Bulk](#search-by-login-bulk)
   - [Search by Domain](#internal-search-by-domain)
   - [Search by Domain Bulk](#internal-search-by-domain-bulk)
9. [Credential Segregation](#credential-segregation)
10. [Usage Endpoint](#usage-endpoint)

---

#### Authentication

All endpoints (except `/health`) require an API key to be provided in the request headers.

##### Header Format

```http
api-key: YOUR_API_KEY
```

The API validates the key and stores relevant data for rate limiting and usage tracking.

---

#### Rate Limiting

The API implements a multi-level rate limiting system:

1. **Basic Rate Limiting**

```json
{
  "windowMs": 60000, // 1 minute window
  "max": "dynamic", // Based on API key configuration
  "headers": true
}
```

2. **Complex Usage Limits**
   - Daily request limits
   - Monthly request limits
   - Endpoint-specific limits

Rate limit information is provided in response headers:

```http
X-RateLimit-Limit: {limit}
X-RateLimit-Remaining: {remaining}
X-RateLimit-Reset: {reset_time}
```

When rate limit is exceeded:

```json
{
  "meta": {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded",
      "retryAfter": 60
    }
  },
  "data": null
}
```

#### Pagination

The API implements standardized pagination across all endpoints. Pagination information is included in the response metadata.

##### Pagination Parameters

| Parameter  | Type   | Default | Description              |
| ---------- | ------ | ------- | ------------------------ |
| `page`     | Number | 1       | Page number to retrieve  |
| `pageSize` | Number | 50      | Items per page (max: 50) |

##### Pagination Response Structure

For single search endpoints:

```json
{
  "meta": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 100,
  "page": 2,
  "pageSize": 50,
  "data": [...]
}
```

For bulk search endpoints:

```json
{
  "metadata": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "234.56ms"
  },
  "search_counts": {
    "example1@domain.com": 100,
    "example2@domain.com": 50
  },
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "data": [
    {
      "identifier": "example1@domain.com",
      "pagination": {
        "total_items": 100,
        "total_pages": 2,
        "current_page": 1,
        "page_size": 50,
        "has_next_page": true,
        "has_previous_page": false,
        "next_page": 2,
        "previous_page": null
      },
      "data": [...]
    }
  ]
}
```

---

#### Date Normalization

The API automatically normalizes dates in the response to ISO 8601 format (UTC). Date normalization applies to:

- `Log date` field
- `Date` field

Example of normalized dates:

```json
{
  "Log date": "2023-07-23T09:38:30.000Z",
  "Date": "2023-07-23T09:38:30.000Z"
}
```

---

#### Error Responses

All error responses follow a standardized format:

```json
{
  "meta": {
    "error": {
      "code": "ERROR_CODE",
      "message": "Detailed error message",
      "details": {
        "parameter": "affected_parameter",
        "received": "received_value",
        "allowed": ["allowed", "values"]
      }
    }
  },
  "data": null
}
```

##### Common Error Codes

| Status Code | Error Code            | Description                |
| ----------- | --------------------- | -------------------------- |
| 400         | BAD_REQUEST           | Invalid input parameters   |
| 401         | UNAUTHORIZED          | Missing or invalid API key |
| 403         | FORBIDDEN             | Insufficient permissions   |
| 404         | NOT_FOUND             | Resource not found         |
| 429         | RATE_LIMIT_EXCEEDED   | Rate limit exceeded        |
| 500         | INTERNAL_SERVER_ERROR | Server error               |

##### Example Error Responses

Invalid Parameter:

```json
{
  "meta": {
    "error": {
      "code": "BAD_REQUEST",
      "message": "Invalid pagination parameters",
      "details": {
        "errors": ["Page size must be between 1 and 50"]
      }
    }
  },
  "data": null
}
```

Rate Limit Exceeded:

```json
{
  "meta": {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded",
      "retryAfter": 60,
      "details": {
        "limit": "daily",
        "reset": "2023-07-24T00:00:00.000Z"
      }
    }
  },
  "data": null
}
```

#### V1 Routes

##### Search by Mail

###### Endpoints

- `GET /api/json/v1/search-by-mail`
- `POST /api/json/v1/search-by-mail`

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `mail`      | String | Yes      | Email address to search                                     |
| `type`      | String | No       | Search type: "strict" (default) or "all"                    |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "meta": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 17,
  "page": 1,
  "pageSize": 5,
  "data": [
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
      "CustomerCredentials": [
        {
          "URL": "https://example.com",
          "Username": "customer@external.com",
          "Password": "password789"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "other@domain.com",
          "Password": "password000"
        }
      ]
    }
  ]
}
```

##### Search by Mail Bulk

###### Endpoint

- `POST /api/json/v1/search-by-mail/bulk`

###### Request Body

```json
{
  "mails": ["example1@domain.com", "example2@domain.com"]
}
```

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `type`      | String | No       | Search type: "strict" (default) or "all"                    |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "metadata": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "asc"
    },
    "processing_time": "234.56ms"
  },
  "search_counts": {
    "example1@domain.com": 100,
    "example2@domain.com": 50
  },
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "data": [
    {
      "mail": "example1@domain.com",
      "pagination": {
        "total_items": 100,
        "total_pages": 2,
        "current_page": 1,
        "page_size": 50,
        "has_next_page": true,
        "has_previous_page": false,
        "next_page": 2,
        "previous_page": null
      },
      "data": [
        {
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "InternalCredentials": [...],
          "ExternalCredentials": [...],
          "CustomerCredentials": [...],
          "OtherCredentials": [...]
        }
      ]
    }
  ]
}
```

##### Search by Domain

###### Endpoints

- `GET /api/json/v1/search-by-domain`
- `POST /api/json/v1/search-by-domain`

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `domain`    | String | Yes      | Domain name to search                                       |
| `type`      | String | No       | Search type: "strict" (default) or "all"                    |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "meta": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 17,
  "page": 1,
  "pageSize": 5,
  "data": [
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
      "CustomerCredentials": [
        {
          "URL": "https://example.com",
          "Username": "customer@external.com",
          "Password": "password789"
        }
      ],
      "OtherCredentials": [
        {
          "URL": "https://thirdsite.com",
          "Username": "other@domain.com",
          "Password": "password000"
        }
      ]
    }
  ]
}
```

##### Search by Domain Bulk

###### Endpoint

- `POST /api/json/v1/search-by-domain/bulk`

###### Request Body

```json
{
  "domains": ["example1.com", "example2.com"]
}
```

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `type`      | String | No       | Search type: "strict" (default) or "all"                    |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "metadata": {
    "query_type": "strict",
    "sort": {
      "field": "date_compromised",
      "order": "asc"
    },
    "processing_time": "234.56ms"
  },
  "search_counts": {
    "example1.com": 100,
    "example2.com": 50
  },
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "data": [
    {
      "domain": "example1.com",
      "pagination": {
        "total_items": 100,
        "total_pages": 2,
        "current_page": 1,
        "page_size": 50,
        "has_next_page": true,
        "has_previous_page": false,
        "next_page": 2,
        "previous_page": null
      },
      "data": [
        {
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "InternalCredentials": [...],
          "ExternalCredentials": [...],
          "CustomerCredentials": [...],
          "OtherCredentials": [...]
        }
      ]
    }
  ]
}
```

#### Internal Routes

Internal routes follow a similar structure but do not include credential segregation.

##### Search by Login

###### Endpoints

- `GET /api/json/internal/search-by-login`
- `POST /api/json/internal/search-by-login`

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `login`     | String | Yes      | Login to search                                             |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "meta": {
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 17,
  "page": 1,
  "pageSize": 5,
  "data": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "Credentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ]
    }
  ]
}
```

##### Search by Login Bulk

###### Endpoint

- `POST /api/json/internal/search-by-login/bulk`

###### Request Body

```json
{
  "logins": ["user1", "user2"]
}
```

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "meta": {
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "234.56ms"
  },
  "search_counts": {
    "user1": 100,
    "user2": 50
  },
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "data": [
    {
      "login": "user1",
      "pagination": {
        "total_items": 100,
        "total_pages": 2,
        "current_page": 1,
        "page_size": 50,
        "has_next_page": true,
        "has_previous_page": false,
        "next_page": 2,
        "previous_page": null
      },
      "data": [
        {
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "Credentials": [
            {
              "URL": "https://example.com",
              "Username": "user1",
              "Password": "password123"
            }
          ]
        }
      ]
    }
  ]
}
```

##### Internal Search by Domain

###### Endpoints

- `GET /api/json/internal/search-by-domain`
- `POST /api/json/internal/search-by-domain`

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `domain`    | String | Yes      | Domain to search                                            |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "meta": {
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "total": 17,
  "page": 1,
  "pageSize": 5,
  "data": [
    {
      "Log date": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z",
      "Credentials": [
        {
          "URL": "https://example.com",
          "Username": "user@example.com",
          "Password": "password123"
        }
      ]
    }
  ]
}
```

##### Internal Search by Domain Bulk

###### Endpoint

- `POST /api/json/internal/search-by-domain/bulk`

###### Request Body

```json
{
  "domains": ["example1.com", "example2.com"]
}
```

###### Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |
| `page`      | Number | No       | Page number (default: 1)                                    |
| `pageSize`  | Number | No       | Results per page (default: 50, max: 50)                     |

###### Response Structure

```json
{
  "meta": {
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "234.56ms"
  },
  "search_counts": {
    "example1.com": 100,
    "example2.com": 50
  },
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "data": [
    {
      "domain": "example1.com",
      "pagination": {
        "total_items": 100,
        "total_pages": 2,
        "current_page": 1,
        "page_size": 50,
        "has_next_page": true,
        "has_previous_page": false,
        "next_page": 2,
        "previous_page": null
      },
      "data": [
        {
          "Log date": "2023-07-23T09:38:30.000Z",
          "Date": "2023-07-23T09:38:30.000Z",
          "Credentials": [
            {
              "URL": "https://example.com",
              "Username": "user@example.com",
              "Password": "password123"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Credential Segregation

Credential segregation is only available in V1 routes. The credentials are categorized into four distinct arrays based on the following criteria:

##### For Mail Searches:

1. **InternalCredentials**

   - URL contains searched email's domain AND username contains searched email
   - Example: Searching for "user@example.com" finds credentials where URL contains "example.com" and username is "user@example.com"

2. **ExternalCredentials**

   - URL does NOT contain searched email's domain BUT username contains searched email
   - Example: Searching for "user@example.com" finds credentials where URL is "othersite.com" but username is "user@example.com"

3. **CustomerCredentials**

   - URL contains searched email's domain BUT username does NOT contain searched email
   - Example: Searching for "user@example.com" finds credentials where URL contains "example.com" but username is different

4. **OtherCredentials**
   - All remaining credentials that don't match any of the above criteria

##### For Domain Searches:

1. **InternalCredentials**

   - URL contains searched domain AND username contains the domain
   - Example: Searching for "example.com" finds credentials where URL contains "example.com" and username contains "@example.com"

2. **ExternalCredentials**

   - URL does NOT contain searched domain BUT username contains the domain
   - Example: Searching for "example.com" finds credentials where URL is different but username contains "@example.com"

3. **CustomerCredentials**

   - URL contains searched domain BUT username does NOT contain the domain
   - Example: Searching for "example.com" finds credentials where URL contains "example.com" but username has different domain

4. **OtherCredentials**
   - All remaining credentials that don't match any of the above criteria

Note: Internal routes return credentials in their original format without segregation, using a single `Credentials` array in the response.

#### Usage Endpoint

The usage endpoint provides information about API key usage and limits.

##### Endpoint

- `GET /api/json/v1/usage`

##### Authentication

Requires API key authentication like other endpoints.

##### Response Structure

```json
{
  "remaining_daily_requests": 982,
  "remaining_monthly_requests": 9842,
  "total_daily_limit": 1000,
  "total_monthly_limit": 10000,
  "current_daily_usage": 18,
  "current_monthly_usage": 158,
  "status": "active"
}
```

##### Response Fields

| Field                        | Type   | Description                                  |
| ---------------------------- | ------ | -------------------------------------------- |
| `remaining_daily_requests`   | Number | Remaining requests for current day           |
| `remaining_monthly_requests` | Number | Remaining requests for current month         |
| `total_daily_limit`          | Number | Maximum daily request limit                  |
| `total_monthly_limit`        | Number | Maximum monthly request limit                |
| `current_daily_usage`        | Number | Requests used today                          |
| `current_monthly_usage`      | Number | Requests used this month                     |
| `status`                     | String | API key status ("active", "suspended", etc.) |

##### Error Responses

Follows the standard error response format:

```json
{
  "meta": {
    "error": {
      "code": "NOT_FOUND",
      "message": "Usage statistics not found"
    }
  },
  "data": null
}
```

#### Date Handling

The API uses the "Date Compromised" field for all date-based operations. This field is stored in a standardized format (YYYY-MM-DD HH:mm:ss) in the database.

##### Sort Parameters

| Parameter   | Type   | Required | Description                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------- |
| `sortby`    | String | No       | Sort field: "date_compromised" (default) or "date_uploaded" |
| `sortorder` | String | No       | Sort order: "desc" (default) or "asc"                       |

When `sortby=date_compromised`, the API sorts using the "Date Compromised" field.
When `sortby=date_uploaded`, the API sorts using the "Date" field.

Example Response with Sort Information:

```json
{
  "meta": {
    "sort": {
      "field": "date_compromised",
      "order": "desc"
    },
    "processing_time": "123.45ms"
  },
  "data": [
    {
      "Date Compromised": "2023-07-23T09:38:30.000Z",
      "Date": "2023-07-23T09:38:30.000Z"
      // ... other fields
    }
  ]
}
```

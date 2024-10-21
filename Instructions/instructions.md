# Project Requirement Document (PRD)

## Project Title:

**Robust Cybercrime Intelligence Feed API Backend**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current File Structure](#current-file-structure)
3. [Database Schema Reference](#database-schema-reference)
4. [Implemented Features](#implemented-features)
   - [Authentication](#authentication)
   - [Rate Limiting](#rate-limiting)
   - [Search By Login Endpoint](#search-by-login-endpoint)
5. [Implementation Details](#implementation-details)
   - [Database Connection](#database-connection-configdatabasejs)
   - [Login Controller](#login-controller-controllerslogincontrollerjs)
   - [Date Normalization](#date-normalization-servicesdateservicejs)
   - [Middleware](#middleware)
6. [Future Enhancements](#future-enhancements)
7. [Conclusion](#conclusion)

---

## Project Overview

You are building a continuously augmented cybercrime API composed of millions of machine credentials compromised by info-stealers in global malware-spreading campaigns. It provides clients the ability to query a MongoDB database of over **29,919,523** computers compromised through global info-stealer campaigns performed by threat actors. The database is updated daily with new compromised computers, offering cybersecurity providers the ability to alert security teams ahead of imminent attacks when users get compromised and have their credentials stolen.

You will be using **Express.js** for the backend framework and **MongoDB** as the database. Additional dependencies can be added as needed.

---

## Current File Structure

```
creds-api-backend/
├── __tests__
│   ├── dateService.test.js
│   └── loginController.test.js
├── app.js
├── config
│   ├── database.js
│   └── logger.js
├── controllers
│   └── loginController.js
├── database.js
├── logs
│   ├── combined.log
│   ├── date_parsing_errors.log
│   └── error.log
├── middlewares
│   ├── authMiddleware.js
│   ├── complexRateLimitMiddleware.js
│   ├── dateNormalizationMiddleware.js
│   └── rateLimitMiddleware.js
├── package-lock.json
├── package.json
├── routes
│   └── api
│       └── v1
├── sample.json
├── services
│   └── dateService.js
├── test.js
└── utils
    └── paginationUtils.js
```

---

## Database Schema Reference

To understand the data structure, here's an example entry from the database for schema reference:

```json
{
  "_id": "hetzwRf4m-64bd57e730de2dbb8183fa8a",
  "Stealer Type": "RedLine",
  "Folder Name": "CLE8092C7AD8A33B6B471EC5F4B8828DC6_2022_05_17T05_28_48_375121",
  "Date": "2023-07-23 09:38:30",
  "Has Screenshot": true,
  "Has Cookies": true,
  "Build ID": "Build#10k",
  "IP": "127.0.0.1",
  "FileLocation": "C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\AppLaunch.exe",
  "UserName": "natal",
  "Country": "CL",
  "Postal Code": "1700000",
  "Location": "La Serena, Coquimbo",
  "HWID": "E8092C7AD8A33B6B471EC5F4B8828DC6",
  "Current Language": "Spanish (Spain, International Sort)",
  "TimeZone": "(UTC-04:00) Santiago",
  "Operating System": "Windows 10 Home x64",
  "UAC": "AllowAll",
  "Process Elevation": "False",
  "Log date": "17.05.2022 5:28:48",
  "Keyboard Layouts": "Spanish (Spain, International Sort)",
  "CPU": "Intel(R) Core(TM) i5-10300H CPU @ 2.50GHz, 4 Cores",
  "Anti-Viruses": "Windows Defender",
  "Credentials": [
    {
      "URL": "https://test.com/",
      "Username": "testname",
      "Password": "testpass",
      "Application": "Opera GX_Unknown"
    }
  ],
  "Hash": "00004f5977440098482fcfe5712bb9a803babade75e009a947e252808c85b2b1",
  "Usernames": ["test@gmail.com", "test", "name", "123username"]
}
```

Note: The `Usernames` array is now used for searching instead of `Credentials.Username`.

## Implemented Features

1. **MongoDB Connection**: Implemented in `config/database.js`.
2. **Authentication**: API key-based authentication implemented in `middlewares/authMiddleware.js`.
3. **Rate Limiting**: Implemented in `middlewares/complexRateLimitMiddleware.js`.
4. **Search by Login**: Implemented in `controllers/loginController.js`.
5. **Date Normalization**: Implemented in `services/dateService.js` and `middlewares/dateNormalizationMiddleware.js`.
6. **Pagination**: Implemented in `utils/paginationUtils.js`.
7. **Logging**: Implemented using Winston in `config/logger.js`.

---

### Authentication

- **Method**: API key provided as a header named `api-key`.
- **Implementation**: `middlewares/authMiddleware.js`

### Rate Limiting

- **Limit**: 50 requests per 10 seconds per API key.
- **Implementation**: `middlewares/complexRateLimitMiddleware.js`

### Search By Login Endpoint

- **URL**: `/api/json/v1/search-by-login`
- **HTTP Methods**: POST, GET
- **Request Body**:
  ```json
  {
    "login": "john@gmail.com"
  }
  ```
- **Query Parameters**:

  - `sortby`: `date_compromised` or `date_uploaded` (default: `date_compromised`)
  - `page`: Number (default: 1)
  - `installed_software`: Boolean (default: false, not yet implemented)

- **Database Fields Mapping**:

## Implementation Details

### Database Connection (`config/database.js`)

- Uses MongoDB driver for connection.
- Implements connection pooling and error handling.
- Creates an index on the `Usernames` field in the `logs` collection.

### Login Controller (`controllers/loginController.js`)

- Implements the `searchByLogin` function.
- Searches for the login in the `Usernames` array.
- Applies sorting, pagination, and date normalization.

### Date Normalization (`services/dateService.js`)

- Normalizes dates to the format `YYYY-MM-DD HH:MM:SS`.
- Handles multiple input date formats.

### Middleware

- **Authentication**: Validates API key.
- **Rate Limiting**: Implements complex rate limiting based on API key and IP.
- **Date Normalization**: Normalizes dates in the response.

---

## Future Enhancements

1. Implement the `installed_software` feature.
2. Add more search endpoints (e.g., search by domain, IP).
3. Implement caching for frequently accessed data.
4. Add more comprehensive error handling and validation.

---

## Conclusion

This updated PRD reflects the current state of the Cybercrime Intelligence Feed API Backend. The core functionality of searching by login has been implemented, along with essential features like authentication, rate limiting, and date normalization. Future work will focus on expanding the API's capabilities and optimizing its performance.

---

**Note to Engineering Team**:

Please ensure that all development aligns with the specifications provided. Pay particular attention to the date normalization logic, as consistent date formatting is crucial for the API's functionality. Additionally, include comments in the codebase where future features will be integrated to facilitate smooth updates.

**Regarding the Database Schema**:

- Ensure that the `user.js` model accurately reflects the database schema, including all necessary fields.
- When querying for credentials by login, remember that the `Credentials` field is an array of objects. You'll need to query nested array elements to find matching usernames.
- Be mindful of performance considerations when querying large datasets. Utilize appropriate indexing and query optimization techniques.

If any questions or issues arise during implementation, do not hesitate to seek clarification to ensure the project's success.

---

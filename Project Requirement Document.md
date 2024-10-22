# API ENDPOINTS TO BE IMPLEMENTED

## 1. Search By Login (Bulk)

This API Endpoint is almost like search-by-login but can support bulk email (more than one) searching in one request. the schema and bussiness logic as same as search-by-login endpoint so please use the documentation of search-by-login implemtation as reference.

### URL Parameters:

| Parameter          | Options/Data Type                     | Default          | Explanation                                                                                                                                                                                                                |
| ------------------ | ------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sortby             | 1.date_compromised<br>2.date_uploaded | date_compromised | The API allows for sorting of the machine records by date of compromise or date added to Hudson Rock's system, with the results being returned in descending order.                                                        |
| page               | Number                                | 1                | The API utilises data pagination, where a maximum of 50 documents (stealers) per request are returned. When querying for a specific page, such as page 2, the API will skip the first 50 documents and return the next 50. |
| installed_software | Boolean (true/false)                  | false            | When set to true, installed software from the compromised computer will be shown.                                                                                                                                          |

### Body:

| Parameter | Options/Data Type | Limitations                                     | Example                                 |
| --------- | ----------------- | ----------------------------------------------- | --------------------------------------- |
| logins    | Array             | Maximum of 10 email addresses for each request. | ["johndoe@gmail.com", "john@gmail.com"] |

### Supposed Requests

#### SINGLE REQUEST

```
curl -L -X POST 'https://localhost/api/json/v1/search-by-login/bulk'         -H 'api-key: test'         -H 'Content-Type: application/json'         --data-raw '{"logins": ["johndoe@gmail.com", "john@gmail.com"]}'
```

#### SINGLE REQUEST (SORTED BY DATE UPLOADED)

```
curl -L -X POST 'https://localhost/api/json/v1/search-by-login/bulk?sortby=date_uploaded'                 -H 'api-key: test'                 -H 'Content-Type: application/json'                 --data-raw '{"logins": ["johndoe@gmail.com", "john@gmail.com"]}'
```

#### SINGLE REQUEST (SORTED BY DATE UPLOADED) - PAGE 2

```
curl -L -X POST 'https://localhost/api/json/v1/search-by-login/bulk?sortby=date_uploaded&page=2'                         -H 'api-key: test'                         -H 'Content-Type: application/json'                         --data-raw '{"logins": ["johndoe@gmail.com", "john@gmail.com"]}'
```

#!/bin/bash

API_KEY="your_api_key_here"
URL="http://localhost:3000/api/json/v1/search-by-login"

for i in {1..60}
do
   curl -s -o /dev/null -w "%{http_code}\n" -X POST $URL \
   -H "api-key: $API_KEY" \
   -H "Content-Type: application/json" \
   -d '{"login":"john@gmail.com"}'
   sleep 0.1
done

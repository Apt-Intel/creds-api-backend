const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3000/api/json/v1";
const API_KEY = "your_api_key_here";

async function testSearchByDomain() {
  const response = await fetch(
    `${API_BASE_URL}/search-by-domain?domain=example.com`,
    {
      headers: { "api-key": API_KEY },
    }
  );
  const data = await response.json();
  console.log("Search by Domain Result:", data);
}

async function testSearchByDomainBulk() {
  const response = await fetch(`${API_BASE_URL}/search-by-domain/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY,
    },
    body: JSON.stringify({
      domains: ["example.com", "test.com"],
    }),
  });
  const data = await response.json();
  console.log("Search by Domain Bulk Result:", data);
}

async function runTests() {
  await testSearchByDomain();
  await testSearchByDomainBulk();
}

runTests().catch(console.error);

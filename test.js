const axios = require("axios");

async function testSearchByLogin() {
  try {
    console.log("Sending request...");
    const response = await axios.post(
      "http://localhost:3000/api/json/v1/search-by-login",
      { login: "christianner.reyes@gmail.com" },
      { headers: { "api-key": "test" } }
    );
    console.log("Response received:", response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

testSearchByLogin();

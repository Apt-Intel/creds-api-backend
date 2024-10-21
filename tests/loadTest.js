const autocannon = require("autocannon");

const instance = autocannon(
  {
    url: "http://localhost:3000/api/json/v1/search-by-login",
    connections: 10, // Reduced from 100 to avoid overwhelming the rate limit immediately
    pipelining: 1,
    duration: 30, // Increased to 30 seconds to observe rate limiting behavior
    method: "POST",
    headers: {
      "api-key": process.env.API_KEY || "test", // Use environment variable if available, fallback to "test"
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login: "test@example.com" }),
  },
  console.log
);

autocannon.track(instance, { renderProgressBar: true });

// Log the results
instance.on("done", (results) => {
  console.log("Test completed");
  console.log("Latency (ms):", results.latency);
  console.log("Requests/sec:", results.requests.average);
  console.log("Throughput/sec:", results.throughput.average);
  console.log("Errors:", results.errors);
  console.log("2xx responses:", results["2xx"]);
  console.log("Non-2xx responses:", results.non2xx);
});

// Handle any errors
instance.on("error", (err) => {
  console.error("Error during load test:", err);
});

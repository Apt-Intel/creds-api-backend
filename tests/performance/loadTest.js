const autocannon = require("autocannon");

const instance = autocannon(
  {
    url: "http://localhost:3000/api/json/v1/search-by-login",
    connections: 10, // Adjusted to avoid overwhelming the server
    pipelining: 1,
    duration: 30, // Duration of the test in seconds
    method: "POST",
    headers: {
      "api-key": process.env.API_KEY || "test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login: "test@example.com" }),
  },
  console.log
);

autocannon.track(instance, { renderProgressBar: true });

instance.on("done", (results) => {
  console.log("Test completed");
  console.log("Latency (ms):", results.latency);
  console.log("Requests/sec:", results.requests.average);
  console.log("Throughput/sec:", results.throughput.average);
  console.log("Errors:", results.errors);
  console.log("2xx responses:", results["2xx"]);
  console.log("Non-2xx responses:", results.non2xx);
});

instance.on("error", (err) => {
  console.error("Error during load test:", err);
});

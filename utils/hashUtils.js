const crypto = require("crypto");

const hashApiKey = (apiKey) => {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};

module.exports = { hashApiKey };

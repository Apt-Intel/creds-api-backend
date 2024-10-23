const { parse } = require("tldts");
const punycode = require("punycode/");
const LRU = require("lru-cache");

const cache = new LRU({
  max: 1000, // Store max 1000 items
  maxAge: 1000 * 60 * 60, // 1 hour
});

async function sanitizeDomain(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Check cache first
  const cachedResult = cache.get(input);
  if (cachedResult) {
    return cachedResult;
  }

  // Trim whitespace and convert to lowercase
  let domain = input.trim().toLowerCase();

  // Remove common prefixes
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

  // Parse the domain
  const parsedDomain = parse(domain);

  if (!parsedDomain.domain) {
    return null;
  }

  // Convert Punycode domains to Unicode
  domain = punycode.toUnicode(parsedDomain.domain);

  // Validate the domain format (simplified regex)
  const domainRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
  if (!domainRegex.test(domain)) {
    return null;
  }

  // Cache the result
  cache.set(input, domain);

  return domain;
}

module.exports = { sanitizeDomain };

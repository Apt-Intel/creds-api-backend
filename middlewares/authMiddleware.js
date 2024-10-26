const { getApiKeyDetails } = require("../services/apiKeyService");
const logger = require("../config/logger");
const url = require("url");

const checkEndpointAccess = (requestedEndpoint, allowedEndpoints) => {
  if (!Array.isArray(allowedEndpoints)) {
    logger.warn(
      `Invalid allowedEndpoints: ${JSON.stringify(allowedEndpoints)}`
    );
    return false;
  }

  if (allowedEndpoints.includes("all")) {
    return true;
  }

  // Normalize the requested endpoint
  const parsedUrl = url.parse(requestedEndpoint);
  let normalizedRequestedEndpoint = parsedUrl.pathname
    .replace(/\/+$/, "")
    .toLowerCase();

  logger.info(`Normalized requested endpoint: ${normalizedRequestedEndpoint}`);

  return allowedEndpoints.some((endpoint) => {
    if (typeof endpoint !== "string") {
      logger.warn(
        `Invalid endpoint in allowedEndpoints: ${JSON.stringify(endpoint)}`
      );
      return false;
    }
    let normalizedEndpoint = endpoint.replace(/\/+$/, "").toLowerCase();

    logger.info(
      `Comparing ${normalizedRequestedEndpoint} with ${normalizedEndpoint}`
    );

    return (
      normalizedRequestedEndpoint === normalizedEndpoint ||
      normalizedRequestedEndpoint.startsWith(normalizedEndpoint + "/")
    );
  });
};

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header("api-key");
    if (!apiKey) {
      logger.warn("No API key provided in request");
      return res.status(401).json({ error: "API key is required" });
    }

    const apiKeyData = await getApiKeyDetails(apiKey);
    if (!apiKeyData) {
      logger.warn(`Invalid API key: ${apiKey}`);
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (apiKeyData.status !== "active") {
      logger.warn(`Inactive API key: ${apiKey}, Status: ${apiKeyData.status}`);
      return res.status(401).json({ error: "Inactive API key" });
    }

    // Updated requestedEndpoint to use req.originalUrl
    const requestedEndpoint = req.originalUrl.split("?")[0]; // Remove query parameters

    logger.info(`req.originalUrl: ${req.originalUrl}`);
    logger.info(`Requested endpoint: ${requestedEndpoint}`);

    let allowedEndpoints = apiKeyData.endpointsAllowed;

    logger.info(`Allowed endpoints (raw): ${JSON.stringify(allowedEndpoints)}`);

    // Ensure endpoints_allowed is an array
    if (typeof allowedEndpoints === "string") {
      try {
        allowedEndpoints = JSON.parse(allowedEndpoints);
      } catch (error) {
        logger.error(`Error parsing endpoints_allowed: ${error.message}`);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    // Handle object format and convert to array if necessary
    if (!Array.isArray(allowedEndpoints)) {
      if (typeof allowedEndpoints === "object" && allowedEndpoints !== null) {
        allowedEndpoints = Object.values(allowedEndpoints);
      } else {
        logger.warn(
          `Invalid allowedEndpoints format: ${typeof allowedEndpoints}`
        );
        return res.status(403).json({ error: "Invalid API key configuration" });
      }
    }

    // Flatten the array if it's nested
    allowedEndpoints = allowedEndpoints.flat();

    logger.info(
      `Allowed endpoints (processed): ${JSON.stringify(allowedEndpoints)}`
    );

    const hasAccess = checkEndpointAccess(requestedEndpoint, allowedEndpoints);

    logger.info(`Access granted: ${hasAccess}`);

    if (!hasAccess) {
      logger.warn(
        `Access denied for endpoint ${requestedEndpoint} with API key: ${apiKey}`
      );
      return res
        .status(403)
        .json({ error: "Access to this endpoint is not allowed" });
    }

    req.apiKeyData = apiKeyData;
    logger.info(
      `Authenticated request with API key: ${apiKey} for endpoint: ${requestedEndpoint}`
    );
    next();
  } catch (error) {
    logger.error("Error in authentication middleware:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred during authentication",
    });
  }
};

module.exports = authMiddleware;

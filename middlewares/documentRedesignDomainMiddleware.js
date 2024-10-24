const { sanitizeDomain } = require("../utils/domainUtils");
const logger = require("../config/logger");

const documentRedesignDomainMiddleware = async (req, res, next) => {
  if (!req.searchResults) {
    return next();
  }

  logger.info("Document redesign domain middleware called");
  logger.debug(
    "req.searchResults structure:",
    JSON.stringify(req.searchResults, null, 2)
  );

  const redesignDocument = async (doc, searchedDomain) => {
    logger.debug("Redesigning document:", JSON.stringify(doc, null, 2));

    if (!doc || typeof doc !== "object") {
      logger.warn("Invalid document structure:", doc);
      return doc;
    }

    const {
      "Folder Name": folderName,
      "Build ID": buildId,
      Hash: hash,
      Usernames: usernames,
      Domains: domains,
      Emails: emails,
      Employee: employee,
      Credentials,
      ...remainingFields
    } = doc;

    const categorizedCredentials = {
      InternalCredentials: [],
      ExternalCredentials: [],
      OtherCredentials: [],
    };

    if (Array.isArray(Credentials)) {
      logger.debug("Processing Credentials array");
      for (const cred of Credentials) {
        try {
          const credUrlDomain = cred.URL
            ? await sanitizeDomain(new URL(cred.URL).hostname)
            : null;
          const credUsernameDomain =
            cred.Username && cred.Username.includes("@")
              ? await sanitizeDomain(cred.Username.split("@")[1])
              : null;

          logger.debug("Credential domains:", {
            credUrlDomain,
            credUsernameDomain,
            searchedDomain,
          });

          if (
            credUrlDomain === searchedDomain &&
            credUsernameDomain === searchedDomain
          ) {
            categorizedCredentials.InternalCredentials.push(cred);
          } else if (credUsernameDomain === searchedDomain) {
            categorizedCredentials.ExternalCredentials.push(cred);
          } else {
            categorizedCredentials.OtherCredentials.push(cred);
          }
        } catch (error) {
          logger.warn(`Error processing credential: ${error.message}`, {
            credential: cred,
          });
          categorizedCredentials.OtherCredentials.push(cred);
        }
      }
    } else {
      logger.warn(`Credentials is not an array for document:`, {
        docId: doc._id,
        credentials: Credentials,
      });
    }

    logger.debug("Categorized credentials:", categorizedCredentials);

    return {
      ...remainingFields,
      ...categorizedCredentials,
    };
  };

  try {
    if (
      req.searchResults &&
      req.searchResults.results &&
      Array.isArray(req.searchResults.results)
    ) {
      if (
        req.searchResults.results.length > 0 &&
        req.searchResults.results[0] &&
        "data" in req.searchResults.results[0]
      ) {
        // Bulk search
        logger.info("Processing bulk domain search results");
        req.searchResults.results = await Promise.all(
          req.searchResults.results.map(async (result) => {
            logger.debug("Processing result for domain:", result.domain);
            const searchedDomain = result.domain;
            if (result.data && Array.isArray(result.data)) {
              result.data = await Promise.all(
                result.data.map((doc) => redesignDocument(doc, searchedDomain))
              );
            }
            return result;
          })
        );
      } else {
        // Single search
        logger.info("Processing single domain search results");
        const searchedDomain = req.query.domain || req.body.domain;
        req.searchResults.results = await Promise.all(
          req.searchResults.results.map((doc) =>
            redesignDocument(doc, searchedDomain)
          )
        );
      }
    } else {
      logger.warn("Unexpected searchResults structure:", req.searchResults);
    }

    logger.info("Document redesign for domain completed");
    next();
  } catch (error) {
    logger.error("Error in document redesign domain middleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = documentRedesignDomainMiddleware;

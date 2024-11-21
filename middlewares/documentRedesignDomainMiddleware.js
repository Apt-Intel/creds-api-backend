const { sanitizeDomain } = require("../utils/domainUtils");
const logger = require("../config/logger");

const documentRedesignDomainMiddleware = async (req, res, next) => {
  if (!req.searchResults) {
    return next();
  }

  logger.info("Document redesign domain middleware called");

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
      CustomerCredentials: [],
      OtherCredentials: [],
    };

    const searchedDomainName = searchedDomain.split(".")[0];

    if (Array.isArray(Credentials)) {
      logger.debug("Processing Credentials array");
      for (const cred of Credentials) {
        try {
          const credUrl = cred.URL?.toLowerCase() || "";
          const credUsername = cred.Username?.toLowerCase();

          if (credUrl.includes(searchedDomainName)) {
            // URL contains searched domain name
            if (credUsername?.includes(`@${searchedDomain}`)) {
              // Employee credentials: company domain URL + company email
              categorizedCredentials.InternalCredentials.push(cred);
            } else {
              // Customer credentials: company domain URL + non-company email
              categorizedCredentials.CustomerCredentials.push(cred);
            }
          } else {
            // URL doesn't contain searched domain name
            if (credUsername?.includes(`@${searchedDomain}`)) {
              // External service credentials: non-company URL + company email
              categorizedCredentials.ExternalCredentials.push(cred);
            } else {
              // Completely unrelated credentials
              categorizedCredentials.OtherCredentials.push(cred);
            }
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
      req.searchResults.data &&
      Array.isArray(req.searchResults.data)
    ) {
      if (
        req.searchResults.data.length > 0 &&
        req.searchResults.data[0] &&
        "data" in req.searchResults.data[0]
      ) {
        // Bulk search
        logger.info("Processing bulk domain search results");
        req.searchResults.data = await Promise.all(
          req.searchResults.data.map(async (result) => {
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
        req.searchResults.data = await Promise.all(
          req.searchResults.data.map((doc) =>
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
    next(error);
  }
};

module.exports = documentRedesignDomainMiddleware;

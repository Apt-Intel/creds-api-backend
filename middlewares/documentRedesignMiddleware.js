const logger = require("../config/logger");

const documentRedesignMiddleware = async (req, res, next) => {
  try {
    // Skip if no data in response
    if (!req.searchResults?.data) {
      logger.warn("No data in req.searchResults");
      return next();
    }

    logger.info("Document redesign middleware called");

    const redesignDocument = async (doc, searchedIdentifier) => {
      if (!doc || typeof doc !== "object") {
        logger.warn("Invalid document structure:", doc);
        return doc;
      }

      // First, extract all fields except the ones we want to remove
      const {
        "Folder Name": folderName,
        "Build ID": buildId,
        Hash: hash,
        Usernames: usernames,
        Domains: domains,
        Emails: emails,
        Employee: employee,
        Credentials: originalCredentials,
        ...remainingFields
      } = doc;

      // Initialize searchedEmail and its domain
      let searchedEmail = null;
      let searchedDomain = null;
      let searchedDomainName = null;

      if (searchedIdentifier && searchedIdentifier.includes("@")) {
        searchedEmail = searchedIdentifier.toLowerCase();
        searchedDomain = searchedIdentifier.split("@")[1].toLowerCase();
        searchedDomainName = searchedDomain.split(".")[0];
      }

      const categorizedCredentials = {
        InternalCredentials: [],
        ExternalCredentials: [],
        CustomerCredentials: [],
        OtherCredentials: [],
      };

      if (Array.isArray(originalCredentials)) {
        for (const cred of originalCredentials) {
          try {
            const credUrl = cred.URL?.toLowerCase() || "";
            const credUsername = cred.Username?.toLowerCase();

            if (
              credUrl.includes(searchedDomainName) &&
              credUsername === searchedEmail
            ) {
              // Employee using company email on company domain
              categorizedCredentials.InternalCredentials.push(cred);
            } else if (
              !credUrl.includes(searchedDomainName) &&
              credUsername === searchedEmail
            ) {
              // Employee using company email on external services
              categorizedCredentials.ExternalCredentials.push(cred);
            } else if (
              credUrl.includes(searchedDomainName) &&
              credUsername !== searchedEmail
            ) {
              // Customer credentials on company domain
              categorizedCredentials.CustomerCredentials.push(cred);
            } else {
              // Everything else
              categorizedCredentials.OtherCredentials.push(cred);
            }
          } catch (error) {
            logger.warn(`Error processing credential: ${error.message}`, {
              credential: cred,
            });
            categorizedCredentials.OtherCredentials.push(cred);
          }
        }
      }

      // Create new document structure without original Credentials
      const redesignedDoc = {
        ...remainingFields,
        InternalCredentials: categorizedCredentials.InternalCredentials,
        ExternalCredentials: categorizedCredentials.ExternalCredentials,
        CustomerCredentials: categorizedCredentials.CustomerCredentials,
        OtherCredentials: categorizedCredentials.OtherCredentials,
      };

      logger.debug("Redesigned document structure:", {
        hasOriginalCredentials: "Credentials" in redesignedDoc,
        hasCategorizedCredentials: [
          "InternalCredentials" in redesignedDoc,
          "ExternalCredentials" in redesignedDoc,
          "CustomerCredentials" in redesignedDoc,
          "OtherCredentials" in redesignedDoc,
        ],
      });

      return redesignedDoc;
    };

    // Handle both single and bulk responses
    if (Array.isArray(req.searchResults.data)) {
      const isBulkResponse =
        req.searchResults.data[0]?.pagination !== undefined;

      if (isBulkResponse) {
        req.searchResults.data = await Promise.all(
          req.searchResults.data.map(async (item) => {
            const identifier = item.mail; // Only handle mail identifiers
            const processedData = await Promise.all(
              item.data.map((doc) => redesignDocument(doc, identifier))
            );

            return {
              ...item,
              data: processedData,
            };
          })
        );
      } else {
        const identifier = req.query.mail || req.body.mail; // Only handle mail identifiers
        req.searchResults.data = await Promise.all(
          req.searchResults.data.map((doc) => redesignDocument(doc, identifier))
        );
      }
    }

    logger.info("Document redesign completed");
    next();
  } catch (error) {
    logger.error("Error in document redesign middleware:", {
      error: error.message,
      requestId: req.requestId,
      stack: error.stack,
    });
    next(error);
  }
};

module.exports = documentRedesignMiddleware;

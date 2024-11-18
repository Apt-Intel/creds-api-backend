const express = require("express");
const router = express.Router();
const {
  internalSearchByDomainBulk,
} = require("../../../controllers/internal/domainBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
const logger = require("../../../config/logger");

// Add logging to verify route registration
logger.info("Registering internal domain bulk search route", {
  endpoints: ["POST /search-by-domain/bulk"],
});

router.post(
  "/search-by-domain/bulk",
  internalSearchByDomainBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

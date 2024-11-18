const express = require("express");
const router = express.Router();
const {
  internalSearchByDomain,
} = require("../../../controllers/internal/domainController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
const logger = require("../../../config/logger");

// Add logging to verify route registration
logger.info("Registering internal domain search routes", {
  endpoints: ["GET /search-by-domain", "POST /search-by-domain"],
});

router.get(
  "/search-by-domain",
  internalSearchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-domain",
  internalSearchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

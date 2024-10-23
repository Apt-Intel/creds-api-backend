const express = require("express");
const router = express.Router();
const {
  searchByDomainBulk,
} = require("../../../controllers/internal/domainBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-domain/bulk",
  searchByDomainBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

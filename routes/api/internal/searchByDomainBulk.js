const express = require("express");
const router = express.Router();
const {
  internalSearchByDomainBulk,
} = require("../../../controllers/internal/domainBulkController");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-domain/bulk",
  internalSearchByDomainBulk,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  searchByDomainBulk,
} = require("../../../controllers/v1/domainBulkController");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-domain/bulk",
  searchByDomainBulk,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  searchByMailBulk,
} = require("../../../controllers/v1/mailBulkController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-mail/bulk",
  searchByMailBulk,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;
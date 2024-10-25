const express = require("express");
const router = express.Router();
const { searchByMail } = require("../../../controllers/v1/mailController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");
const authMiddleware = require("../../../middlewares/authMiddleware");

router.get(
  "/search-by-mail",
  authMiddleware,
  searchByMail,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-mail",
  authMiddleware,
  searchByMail,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;

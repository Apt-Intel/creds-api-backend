const express = require("express");
const router = express.Router();
const { searchByMail } = require("../../../controllers/v1/mailController");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignMiddleware = require("../../../middlewares/documentRedesignMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-mail",
  searchByMail,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-mail",
  searchByMail,
  sortingMiddleware,
  documentRedesignMiddleware,
  sendResponseMiddleware
);

module.exports = router;

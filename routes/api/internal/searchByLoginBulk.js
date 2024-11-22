const express = require("express");
const router = express.Router();
const {
  internalSearchByLoginBulk,
} = require("../../../controllers/internal/loginBulkController");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.post(
  "/search-by-login/bulk",
  internalSearchByLoginBulk,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

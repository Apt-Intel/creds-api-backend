const express = require("express");
const router = express.Router();
const {
  internalSearchByLogin,
} = require("../../../controllers/internal/loginController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-login",
  internalSearchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-login",
  internalSearchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

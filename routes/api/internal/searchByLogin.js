const express = require("express");
const router = express.Router();
const {
  internalSearchByLogin,
} = require("../../../controllers/internal/loginController");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-login",
  internalSearchByLogin,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

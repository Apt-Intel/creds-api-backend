const express = require("express");
const router = express.Router();
const {
  internalSearchByDomain,
} = require("../../../controllers/internal/domainController");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-domain",
  internalSearchByDomain,
  sortingMiddleware,
  sendResponseMiddleware
);

module.exports = router;

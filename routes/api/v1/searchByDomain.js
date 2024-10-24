const express = require("express");
const router = express.Router();
const { searchByDomain } = require("../../../controllers/v1/domainController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const documentRedesignDomainMiddleware = require("../../../middlewares/documentRedesignDomainMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-domain",
  searchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignDomainMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-domain",
  searchByDomain,
  dateNormalizationMiddleware,
  sortingMiddleware,
  documentRedesignDomainMiddleware,
  sendResponseMiddleware
);

module.exports = router;

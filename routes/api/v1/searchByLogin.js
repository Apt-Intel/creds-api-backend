const express = require("express");
const router = express.Router();
const logger = require("../../../config/logger");
const { searchByLogin } = require("../../../controllers/loginController");
const dateNormalizationMiddleware = require("../../../middlewares/dateNormalizationMiddleware");
const sortingMiddleware = require("../../../middlewares/sortingMiddleware");
const sendResponseMiddleware = require("../../../middlewares/sendResponseMiddleware");

router.get(
  "/search-by-login",
  (req, res, next) => {
    try {
      logger.info(
        `Received search-by-login request with query params: ${JSON.stringify(
          req.query
        )}`
      );
      next();
    } catch (error) {
      next(error);
    }
  },
  searchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

router.post(
  "/search-by-login",
  (req, res, next) => {
    try {
      logger.info(
        `Received search-by-login POST request with query params: ${JSON.stringify(
          req.query
        )}`
      );
      next();
    } catch (error) {
      next(error);
    }
  },
  searchByLogin,
  dateNormalizationMiddleware,
  sortingMiddleware,
  sendResponseMiddleware
);

// Make sure this test route is present
router.get("/test-date-normalization", (req, res) => {
  res.json({
    testDate1: "2023-07-23 09:38:30",
    testDate2: "17.05.2022 5:28:48",
    testDate3: "2022-05-17T05:28:48.375Z",
    nonDateField: "This is not a date",
  });
});

module.exports = router;

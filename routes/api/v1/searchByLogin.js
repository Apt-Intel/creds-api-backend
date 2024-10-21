const express = require("express");
const router = express.Router();
const { searchByLogin } = require("../../../controllers/loginController");

router.get("/search-by-login", searchByLogin);
router.post("/search-by-login", searchByLogin);

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

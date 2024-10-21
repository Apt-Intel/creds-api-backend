const express = require("express");
const router = express.Router();
const { searchByLogin } = require("../../../controllers/loginController");

router.get("/search-by-login", searchByLogin);
router.post("/search-by-login", searchByLogin);

module.exports = router;

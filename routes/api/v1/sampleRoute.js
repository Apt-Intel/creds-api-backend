const express = require("express");
const router = express.Router();
const { getPaginationParams } = require("../../../utils/paginationUtils");
const loginController = require("../../../controllers/v1/loginController");
const authMiddleware = require("../../../middlewares/authMiddleware");

// Search by login endpoint
router
  .route("/search-by-login")
  .get(authMiddleware, (req, res) => {
    res.json({ message: "Search by login endpoint reached" });
  })
  .post(authMiddleware, (req, res) => {
    res.json({ message: "Search by login endpoint reached" });
  });

// You can keep the sample route if needed, but remove the User model usage
router.get("/sample", async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    res.json({
      message: "Sample paginated data",
      page: page,
      limit: limit,
      total: 0,
      totalPages: 0,
      data: [],
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;

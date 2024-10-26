const express = require("express");
const router = express.Router();
const { getUsageStats } = require("../../../services/loggingService");
const logger = require("../../../config/logger");

router.get("/usage", async (req, res) => {
  try {
    const apiKeyId = req.apiKeyData.id;
    const usageStats = await getUsageStats(apiKeyId);

    if (!usageStats) {
      return res.status(404).json({ error: "Usage statistics not found" });
    }

    res.json({
      remaining_daily_requests: usageStats.remaining_daily_requests,
      remaining_monthly_requests: usageStats.remaining_monthly_requests,
      total_daily_limit: usageStats.daily_limit,
      total_monthly_limit: usageStats.monthly_limit,
      current_daily_usage: usageStats.daily_requests,
      current_monthly_usage: usageStats.monthly_requests,
      status: usageStats.status,
    });
  } catch (error) {
    logger.error("Error fetching usage statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

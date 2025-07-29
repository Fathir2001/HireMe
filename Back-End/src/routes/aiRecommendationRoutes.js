const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const aiRecommendationController = require("../controllers/aiRecommendationController");

// Get AI recommendations for the authenticated user
// GET /api/ai-recommendations
router.get("/", auth, aiRecommendationController.getRecommendations);

// Generate new AI recommendations for the authenticated user
// POST /api/ai-recommendations/generate
router.post(
  "/generate",
  auth,
  aiRecommendationController.generateRecommendations
);

// Get user preferences for AI recommendations
// GET /api/ai-recommendations/preferences
router.get("/preferences", auth, aiRecommendationController.getUserPreferences);

// Update user preferences for AI recommendations
// PUT /api/ai-recommendations/preferences
router.put(
  "/preferences",
  auth,
  aiRecommendationController.updateUserPreferences
);

// Handle recommendation actions (accept, dismiss, snooze, etc.)
// POST /api/ai-recommendations/:recommendationId/action
router.post(
  "/:recommendationId/action",
  auth,
  aiRecommendationController.handleRecommendationAction
);

// Get recommendation analytics (admin only)
// GET /api/ai-recommendations/analytics
router.get(
  "/analytics",
  auth,
  (req, res, next) => {
    // Add admin check here if needed
    // For now, allowing all authenticated users to see their own analytics
    next();
  },
  aiRecommendationController.getRecommendationAnalytics
);

module.exports = router;

const ServiceRecommendation = require("../models/ServiceRecommendation");
const UserPreference = require("../models/UserPreference");
const AIRecommendationService = require("../utils/aiRecommendationService");
const cron = require("node-cron");

class AIRecommendationController {
  constructor() {
    this.aiService = new AIRecommendationService();
    this.setupCronJobs();

    // Bind methods to preserve 'this' context
    this.getRecommendations = this.getRecommendations.bind(this);
    this.generateRecommendations = this.generateRecommendations.bind(this);
    this.getUserPreferences = this.getUserPreferences.bind(this);
    this.updateUserPreferences = this.updateUserPreferences.bind(this);
    this.handleRecommendationAction =
      this.handleRecommendationAction.bind(this);
    this.getRecommendationAnalytics =
      this.getRecommendationAnalytics.bind(this);
  }

  // Get AI recommendations for a user
  async getRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, type, priority } = req.query;

      console.log(`Fetching AI recommendations for user: ${userId}`);

      let query = {
        userId,
        isActive: true,
        isDismissed: false,
      };

      if (type) query.recommendationType = type;
      if (priority) query.priority = priority;

      const recommendations = await ServiceRecommendation.find(query)
        .sort({ priority: -1, confidenceScore: -1, predictedDate: 1 })
        .limit(parseInt(limit))
        .populate("relatedServiceHistory.serviceId")
        .populate("userPreferences.preferredProviders");

      // Calculate urgency scores for each recommendation
      const enrichedRecommendations = recommendations.map((rec) => {
        const urgencyScore = rec.getUrgencyScore();
        const daysUntil = rec.daysUntilRecommended;
        const isOverdue = rec.isOverdue();

        return {
          ...rec.toObject(),
          urgencyScore,
          daysUntil,
          isOverdue,
          actionUrl: `/api/service-requests/create?recommendationId=${rec._id}&serviceType=${rec.serviceType}`,
        };
      });

      res.json({
        success: true,
        recommendations: enrichedRecommendations,
        totalCount: recommendations.length,
        metadata: {
          generatedAt: new Date(),
          hasUrgentRecommendations: enrichedRecommendations.some(
            (r) => r.priority === "urgent"
          ),
          hasOverdueRecommendations: enrichedRecommendations.some(
            (r) => r.isOverdue
          ),
        },
      });
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recommendations",
        error: error.message,
      });
    }
  }

  // Generate new recommendations for a user
  async generateRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const { forceRegenerate = false } = req.body;

      console.log(`Generating AI recommendations for user: ${userId}`);

      // Check if we should generate new recommendations
      if (!forceRegenerate) {
        const recentRecommendations = await ServiceRecommendation.find({
          userId,
          isActive: true,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        });

        if (recentRecommendations.length > 0) {
          return res.json({
            success: true,
            message: "Recent recommendations found, skipping generation",
            recommendations: recentRecommendations,
          });
        }
      }

      console.log(
        "AI Service status:",
        this.aiService ? "initialized" : "undefined"
      );

      if (!this.aiService) {
        throw new Error("AI Service not properly initialized");
      }

      // Generate new recommendations
      const recommendations = await this.aiService.generateRecommendations(
        userId
      );

      res.json({
        success: true,
        message: `Generated ${recommendations.length} new recommendations`,
        recommendations,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate recommendations",
        error: error.message,
      });
    }
  }

  // Update user preferences for AI recommendations
  async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = req.body;

      console.log(`Updating AI preferences for user: ${userId}`);

      let userPrefs = await UserPreference.findOne({ userId });

      if (!userPrefs) {
        userPrefs = new UserPreference({ userId, ...preferences });
      } else {
        // Merge new preferences with existing ones
        userPrefs = Object.assign(userPrefs, preferences);
      }

      await userPrefs.save();

      console.log(
        "AI Service status in updateUserPreferences:",
        this.aiService ? "initialized" : "undefined"
      );

      if (!this.aiService) {
        throw new Error("AI Service not properly initialized");
      }

      // Regenerate recommendations based on new preferences
      const recommendations = await this.aiService.generateRecommendations(
        userId
      );

      res.json({
        success: true,
        message: "Preferences updated successfully",
        preferences: userPrefs,
        newRecommendations: recommendations.length,
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preferences",
        error: error.message,
      });
    }
  }

  // Get user preferences
  async getUserPreferences(req, res) {
    try {
      const userId = req.user.id;

      const preferences = await UserPreference.findOne({ userId });

      if (!preferences) {
        return res.json({
          success: true,
          preferences: null,
          message: "No preferences found for user",
        });
      }

      res.json({
        success: true,
        preferences,
      });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch preferences",
        error: error.message,
      });
    }
  }

  // Handle recommendation actions (accept, dismiss, snooze)
  async handleRecommendationAction(req, res) {
    try {
      const { recommendationId } = req.params;
      const { action, reason, snoozeUntil } = req.body;
      const userId = req.user.id;

      console.log(
        `Handling recommendation action: ${action} for recommendation: ${recommendationId}`
      );

      const recommendation = await ServiceRecommendation.findOne({
        _id: recommendationId,
        userId,
      });

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: "Recommendation not found",
        });
      }

      // Record the action
      recommendation.actions.push({
        action,
        timestamp: new Date(),
        metadata: { reason, snoozeUntil },
      });

      switch (action) {
        case "accept":
          recommendation.isAccepted = true;
          recommendation.acceptedAt = new Date();
          break;

        case "dismiss":
          recommendation.isDismissed = true;
          recommendation.dismissedAt = new Date();
          recommendation.dismissReason = reason;
          recommendation.isActive = false;
          break;

        case "snooze":
          recommendation.predictedDate = new Date(
            snoozeUntil || Date.now() + 7 * 24 * 60 * 60 * 1000
          );
          break;

        case "viewed":
        case "clicked":
          // Just record the action, no state change needed
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid action",
          });
      }

      await recommendation.save();

      // Update user preferences based on action
      await this.updateUserLearningData(userId, recommendationId, action);

      res.json({
        success: true,
        message: `Recommendation ${action}ed successfully`,
        recommendation,
      });
    } catch (error) {
      console.error("Error handling recommendation action:", error);
      res.status(500).json({
        success: false,
        message: "Failed to handle recommendation action",
        error: error.message,
      });
    }
  }

  // Get recommendation analytics for admin
  async getRecommendationAnalytics(req, res) {
    try {
      const { startDate, endDate, userId } = req.query;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      let userFilter = {};
      if (userId) userFilter.userId = userId;

      const pipeline = [
        { $match: { ...dateFilter, ...userFilter } },
        {
          $group: {
            _id: null,
            totalRecommendations: { $sum: 1 },
            acceptedRecommendations: {
              $sum: { $cond: [{ $eq: ["$isAccepted", true] }, 1, 0] },
            },
            dismissedRecommendations: {
              $sum: { $cond: [{ $eq: ["$isDismissed", true] }, 1, 0] },
            },
            overdueRecommendations: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ["$predictedDate", new Date()] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            avgConfidenceScore: { $avg: "$confidenceScore" },
            recommendationsByType: {
              $push: {
                type: "$recommendationType",
                serviceType: "$serviceType",
                priority: "$priority",
              },
            },
          },
        },
      ];

      const analytics = await ServiceRecommendation.aggregate(pipeline);

      // Get breakdown by service type
      const serviceTypeAnalytics = await ServiceRecommendation.aggregate([
        { $match: { ...dateFilter, ...userFilter } },
        {
          $group: {
            _id: "$serviceType",
            count: { $sum: 1 },
            accepted: {
              $sum: { $cond: [{ $eq: ["$isAccepted", true] }, 1, 0] },
            },
            dismissed: {
              $sum: { $cond: [{ $eq: ["$isDismissed", true] }, 1, 0] },
            },
            avgConfidence: { $avg: "$confidenceScore" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Get breakdown by recommendation type
      const typeAnalytics = await ServiceRecommendation.aggregate([
        { $match: { ...dateFilter, ...userFilter } },
        {
          $group: {
            _id: "$recommendationType",
            count: { $sum: 1 },
            accepted: {
              $sum: { $cond: [{ $eq: ["$isAccepted", true] }, 1, 0] },
            },
            avgConfidence: { $avg: "$confidenceScore" },
          },
        },
      ]);

      const result = analytics[0] || {
        totalRecommendations: 0,
        acceptedRecommendations: 0,
        dismissedRecommendations: 0,
        overdueRecommendations: 0,
        avgConfidenceScore: 0,
      };

      res.json({
        success: true,
        analytics: {
          ...result,
          acceptanceRate:
            result.totalRecommendations > 0
              ? (
                  (result.acceptedRecommendations /
                    result.totalRecommendations) *
                  100
                ).toFixed(2)
              : 0,
          dismissalRate:
            result.totalRecommendations > 0
              ? (
                  (result.dismissedRecommendations /
                    result.totalRecommendations) *
                  100
                ).toFixed(2)
              : 0,
          serviceTypeBreakdown: serviceTypeAnalytics,
          recommendationTypeBreakdown: typeAnalytics,
        },
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error fetching recommendation analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
        error: error.message,
      });
    }
  }

  // Update user learning data based on actions
  async updateUserLearningData(userId, recommendationId, action) {
    try {
      const userPrefs = await UserPreference.findOne({ userId });
      if (userPrefs) {
        await userPrefs.recordRecommendationAction(recommendationId, action);
      }
    } catch (error) {
      console.error("Error updating user learning data:", error);
    }
  }

  // Setup cron jobs for automated recommendation generation
  setupCronJobs() {
    // Generate recommendations daily at 6 AM
    cron.schedule("0 6 * * *", async () => {
      console.log("Running daily AI recommendation generation...");
      try {
        await this.generateRecommendationsForAllUsers();
      } catch (error) {
        console.error("Error in daily recommendation generation:", error);
      }
    });

    // Send notification reminders every 3 days at 9 AM
    cron.schedule("0 9 */3 * *", async () => {
      console.log("Sending recommendation reminder notifications...");
      try {
        await this.sendReminderNotifications();
      } catch (error) {
        console.error("Error sending reminder notifications:", error);
      }
    });

    // Clean up old dismissed recommendations weekly
    cron.schedule("0 2 * * 0", async () => {
      console.log("Cleaning up old recommendations...");
      try {
        await this.cleanupOldRecommendations();
      } catch (error) {
        console.error("Error cleaning up recommendations:", error);
      }
    });
  }

  // Generate recommendations for all active users
  async generateRecommendationsForAllUsers() {
    try {
      // Get all users who have had service activity in the last 6 months
      const activeUsers = await ServiceRecommendation.distinct("userId", {
        createdAt: {
          $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
        },
      });

      console.log(
        `Generating recommendations for ${activeUsers.length} active users`
      );

      const results = [];
      for (const userId of activeUsers) {
        try {
          const recommendations = await this.aiService.generateRecommendations(
            userId
          );
          results.push({ userId, count: recommendations.length });
        } catch (error) {
          console.error(
            `Error generating recommendations for user ${userId}:`,
            error
          );
        }
      }

      console.log(
        `Completed daily recommendation generation for ${results.length} users`
      );
      return results;
    } catch (error) {
      console.error("Error in generateRecommendationsForAllUsers:", error);
      throw error;
    }
  }

  // Send reminder notifications for unacted recommendations
  async sendReminderNotifications() {
    try {
      // Find unacted recommendations older than 3 days
      const unactedRecommendations = await ServiceRecommendation.find({
        isActive: true,
        isDismissed: false,
        isAccepted: false,
        createdAt: { $lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        "actions.action": { $nin: ["viewed", "clicked"] },
      }).populate("userId");

      console.log(
        `Sending reminders for ${unactedRecommendations.length} recommendations`
      );

      // In a real implementation, you would send email/SMS notifications here
      // For now, we'll just log the intent
      for (const recommendation of unactedRecommendations) {
        console.log(
          `Would send reminder for recommendation ${recommendation._id} to user ${recommendation.userId}`
        );

        // Record that a notification was sent
        recommendation.notificationsSent.push({
          type: "email",
          sentAt: new Date(),
          status: "sent",
        });

        await recommendation.save();
      }
    } catch (error) {
      console.error("Error sending reminder notifications:", error);
      throw error;
    }
  }

  // Clean up old dismissed recommendations
  async cleanupOldRecommendations() {
    try {
      // Remove dismissed recommendations older than 3 months
      const result = await ServiceRecommendation.deleteMany({
        isDismissed: true,
        dismissedAt: {
          $lte: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
        },
      });

      console.log(
        `Cleaned up ${result.deletedCount} old dismissed recommendations`
      );

      // Deactivate old recommendations that haven't been acted upon
      const deactivateResult = await ServiceRecommendation.updateMany(
        {
          isActive: true,
          isDismissed: false,
          isAccepted: false,
          predictedDate: {
            $lte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          }, // 60 days overdue
        },
        {
          isActive: false,
        }
      );

      console.log(
        `Deactivated ${deactivateResult.modifiedCount} overdue recommendations`
      );
    } catch (error) {
      console.error("Error cleaning up recommendations:", error);
      throw error;
    }
  }
}

module.exports = new AIRecommendationController();

const mongoose = require("mongoose");

const serviceRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceNeeder",
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: [
        "Plumbing",
        "Electrical",
        "Cleaning",
        "Carpentry",
        "Painting",
        "HVAC",
        "Landscaping",
        "Pest Control",
        "Appliance Repair",
        "Home Security",
        "Roofing",
        "Flooring",
      ],
    },
    recommendationType: {
      type: String,
      required: true,
      enum: [
        "predictive_maintenance",
        "seasonal_recommendation",
        "usage_based",
        "emergency_prevention",
      ],
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    predictedDate: {
      type: Date,
      required: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    reasons: [
      {
        type: String,
      },
    ],
    estimatedCost: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
    dismissedAt: {
      type: Date,
    },
    dismissReason: {
      type: String,
    },
    relatedServiceHistory: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceRequest",
        },
        completedAt: Date,
        serviceType: String,
      },
    ],
    locationFactors: {
      weather: String,
      season: String,
      climate: String,
    },
    userPreferences: {
      preferredTimeframes: [String],
      budgetRange: {
        min: Number,
        max: Number,
      },
      preferredProviders: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ApprovedServiceProvider",
        },
      ],
    },
    notificationsSent: [
      {
        type: { type: String, enum: ["email", "sms", "push"] },
        sentAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["sent", "delivered", "failed"],
          default: "sent",
        },
      },
    ],
    actions: [
      {
        action: {
          type: String,
          enum: ["viewed", "clicked", "booked", "dismissed", "snoozed"],
        },
        timestamp: { type: Date, default: Date.now },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
serviceRecommendationSchema.index({ userId: 1, isActive: 1 });
serviceRecommendationSchema.index({ predictedDate: 1, priority: 1 });
serviceRecommendationSchema.index({ serviceType: 1, recommendationType: 1 });
serviceRecommendationSchema.index({ confidenceScore: -1 });

// Virtual for time until recommendation
serviceRecommendationSchema.virtual("daysUntilRecommended").get(function () {
  return Math.ceil((this.predictedDate - new Date()) / (1000 * 60 * 60 * 24));
});

// Method to check if recommendation is overdue
serviceRecommendationSchema.methods.isOverdue = function () {
  return this.predictedDate < new Date() && this.isActive && !this.isAccepted;
};

// Method to calculate urgency score
serviceRecommendationSchema.methods.getUrgencyScore = function () {
  const daysUntil = this.daysUntilRecommended;
  const priorityWeights = { low: 1, medium: 2, high: 3, urgent: 4 };
  const priorityWeight = priorityWeights[this.priority] || 1;

  let urgencyScore = this.confidenceScore * priorityWeight;

  if (daysUntil <= 0) urgencyScore *= 2; // Overdue multiplier
  else if (daysUntil <= 7) urgencyScore *= 1.5; // Within a week
  else if (daysUntil <= 30) urgencyScore *= 1.2; // Within a month

  return Math.min(urgencyScore, 10); // Cap at 10
};

// Static method to get recommendations for a user
serviceRecommendationSchema.statics.getActiveRecommendations = function (
  userId,
  limit = 10
) {
  return this.find({
    userId,
    isActive: true,
    isDismissed: false,
    predictedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Not older than 30 days
  })
    .sort({ priority: -1, confidenceScore: -1, predictedDate: 1 })
    .limit(limit)
    .populate("relatedServiceHistory.serviceId")
    .populate("userPreferences.preferredProviders");
};

// Static method to get overdue recommendations
serviceRecommendationSchema.statics.getOverdueRecommendations = function (
  userId
) {
  return this.find({
    userId,
    isActive: true,
    isDismissed: false,
    predictedDate: { $lt: new Date() },
  }).sort({ predictedDate: 1 });
};

module.exports = mongoose.model(
  "ServiceRecommendation",
  serviceRecommendationSchema
);

const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceNeeder",
      required: true,
      unique: true,
    },
    servicePreferences: {
      preferredServices: [
        {
          serviceType: {
            type: String,
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
          frequency: {
            type: String,
            enum: [
              "weekly",
              "monthly",
              "quarterly",
              "semi-annually",
              "annually",
              "as-needed",
            ],
            default: "as-needed",
          },
          lastService: Date,
          averageInterval: Number, // in days
          importance: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
          },
        },
      ],
      budgetRanges: {
        emergency: { min: Number, max: Number },
        routine: { min: Number, max: Number },
        upgrade: { min: Number, max: Number },
      },
      timePreferences: {
        preferredDays: [
          {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
        ],
        preferredTimes: [
          {
            type: String,
            enum: ["morning", "afternoon", "evening", "anytime"],
          },
        ],
        advanceNotice: {
          type: Number,
          default: 7, // days
        },
      },
      communicationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        frequency: {
          type: String,
          enum: ["immediate", "daily", "weekly", "monthly"],
          default: "weekly",
        },
      },
    },
    homeProfile: {
      homeType: {
        type: String,
        enum: ["apartment", "house", "condo", "townhouse", "other"],
      },
      homeAge: {
        type: Number, // years
      },
      homeSize: {
        squareFeet: Number,
        bedrooms: Number,
        bathrooms: Number,
      },
      appliances: [
        {
          type: {
            type: String,
            enum: [
              "hvac",
              "water_heater",
              "washer",
              "dryer",
              "dishwasher",
              "refrigerator",
              "oven",
              "other",
            ],
          },
          brand: String,
          model: String,
          installDate: Date,
          lastMaintenance: Date,
          warrantyExpiry: Date,
        },
      ],
      specialFeatures: [
        {
          type: String,
          enum: [
            "pool",
            "garden",
            "garage",
            "basement",
            "attic",
            "deck",
            "patio",
            "fireplace",
          ],
        },
      ],
      location: {
        zipCode: String,
        climate: {
          type: String,
          enum: ["tropical", "dry", "temperate", "continental", "polar"],
        },
        environment: {
          type: String,
          enum: ["urban", "suburban", "rural"],
        },
      },
    },
    behaviorProfile: {
      serviceFrequency: {
        type: String,
        enum: ["very_low", "low", "moderate", "high", "very_high"],
        default: "moderate",
      },
      maintenanceStyle: {
        type: String,
        enum: ["reactive", "proactive", "preventive"],
        default: "reactive",
      },
      riskTolerance: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      techSavviness: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      pricesensitivity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },
    learningData: {
      serviceHistory: [
        {
          serviceType: String,
          completedAt: Date,
          satisfaction: {
            type: Number,
            min: 1,
            max: 5,
          },
          cost: Number,
          wasEmergency: Boolean,
          wasRecommended: Boolean,
        },
      ],
      clickthrough: [
        {
          recommendationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRecommendation",
          },
          action: {
            type: String,
            enum: ["viewed", "clicked", "booked", "dismissed", "snoozed"],
          },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      seasonalPatterns: {
        spring: [String], // service types typically requested
        summer: [String],
        fall: [String],
        winter: [String],
      },
    },
    aiInsights: {
      predictedMaintenanceNeeds: [
        {
          serviceType: String,
          probability: Number,
          timeframe: String,
          reasoning: [String],
        },
      ],
      riskAssessments: [
        {
          area: String,
          riskLevel: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
          },
          factors: [String],
          recommendations: [String],
        },
      ],
      costSavingOpportunities: [
        {
          opportunity: String,
          potentialSavings: Number,
          actionRequired: String,
        },
      ],
      lastModelUpdate: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userPreferenceSchema.index({ userId: 1 });
userPreferenceSchema.index({ "homeProfile.homeType": 1 });
userPreferenceSchema.index({ "homeProfile.location.zipCode": 1 });
userPreferenceSchema.index({ "behaviorProfile.maintenanceStyle": 1 });

// Methods
userPreferenceSchema.methods.updateServiceHistory = function (serviceData) {
  this.learningData.serviceHistory.push(serviceData);

  // Keep only last 50 services for performance
  if (this.learningData.serviceHistory.length > 50) {
    this.learningData.serviceHistory =
      this.learningData.serviceHistory.slice(-50);
  }

  return this.save();
};

userPreferenceSchema.methods.recordRecommendationAction = function (
  recommendationId,
  action
) {
  this.learningData.clickthrough.push({
    recommendationId,
    action,
    timestamp: new Date(),
  });

  // Keep only last 100 actions
  if (this.learningData.clickthrough.length > 100) {
    this.learningData.clickthrough = this.learningData.clickthrough.slice(-100);
  }

  return this.save();
};

userPreferenceSchema.methods.getMaintenanceScore = function () {
  const style = this.behaviorProfile.maintenanceStyle;
  const frequency = this.behaviorProfile.serviceFrequency;

  let score = 3; // base score

  if (style === "preventive") score += 2;
  else if (style === "proactive") score += 1;
  else if (style === "reactive") score -= 1;

  const frequencyBonus = {
    very_high: 2,
    high: 1,
    moderate: 0,
    low: -1,
    very_low: -2,
  };

  score += frequencyBonus[frequency] || 0;

  return Math.max(1, Math.min(5, score));
};

userPreferenceSchema.methods.shouldReceiveRecommendation = function (
  serviceType,
  priority
) {
  const servicePrefs = this.servicePreferences.preferredServices.find(
    (s) => s.serviceType === serviceType
  );

  if (!servicePrefs) return true; // Default to sending if no specific preference

  // Check if user is responsive to recommendations
  const recentActions = this.learningData.clickthrough.filter(
    (action) => Date.now() - action.timestamp < 30 * 24 * 60 * 60 * 1000
  ).length; // Last 30 days

  const dismissalRate =
    this.learningData.clickthrough.filter(
      (action) => action.action === "dismissed"
    ).length / Math.max(1, this.learningData.clickthrough.length);

  // Don't send if user dismisses too many recommendations
  if (dismissalRate > 0.7) return false;

  // Always send urgent recommendations
  if (priority === "urgent") return true;

  // Consider user's maintenance style and importance rating
  const maintenanceScore = this.getMaintenanceScore();
  const importance = servicePrefs.importance || 3;

  return maintenanceScore + importance >= 5;
};

module.exports = mongoose.model("UserPreference", userPreferenceSchema);

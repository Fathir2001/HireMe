const ServiceRecommendation = require("../models/ServiceRecommendation");
const UserPreference = require("../models/UserPreference");
const ServiceRequest = require("../models/ServiceRequest");
const CompletedService = require("../models/CompletedService");
const ActiveService = require("../models/ActiveService");

class AIRecommendationService {
  constructor() {
    this.seasonalServiceMappings = {
      spring: ["Plumbing", "HVAC", "Landscaping", "Pest Control", "Roofing"],
      summer: [
        "HVAC",
        "Landscaping",
        "Pest Control",
        "Electrical",
        "Appliance Repair",
      ],
      fall: ["HVAC", "Roofing", "Landscaping", "Cleaning", "Pest Control"],
      winter: [
        "HVAC",
        "Plumbing",
        "Electrical",
        "Home Security",
        "Appliance Repair",
      ],
    };

    this.serviceLifespans = {
      HVAC: { min: 180, max: 365, urgent: 400 }, // days
      Plumbing: { min: 365, max: 730, urgent: 1095 },
      Electrical: { min: 1095, max: 1825, urgent: 2555 },
      "Appliance Repair": { min: 90, max: 365, urgent: 450 },
      "Pest Control": { min: 90, max: 180, urgent: 270 },
      Cleaning: { min: 30, max: 90, urgent: 180 },
      Landscaping: { min: 30, max: 90, urgent: 180 },
      Roofing: { min: 1825, max: 3650, urgent: 5475 },
      Flooring: { min: 1825, max: 5475, urgent: 7300 },
      Painting: { min: 1095, max: 1825, urgent: 2555 },
      Carpentry: { min: 1825, max: 3650, urgent: 5475 },
      "Home Security": { min: 365, max: 730, urgent: 1095 },
    };
  }

  // Main method to generate recommendations for a user
  async generateRecommendations(userId) {
    try {
      console.log(`Generating AI recommendations for user: ${userId}`);

      const [userPrefs, serviceHistory, activeServices] = await Promise.all([
        this.getUserPreferences(userId),
        this.getServiceHistory(userId),
        this.getActiveServices(userId),
      ]);

      const recommendations = [];

      // Generate different types of recommendations
      const predictiveRecommendations =
        await this.generatePredictiveMaintenanceRecommendations(
          userId,
          userPrefs,
          serviceHistory
        );

      const seasonalRecommendations =
        await this.generateSeasonalRecommendations(
          userId,
          userPrefs,
          serviceHistory
        );

      const usageBasedRecommendations =
        await this.generateUsageBasedRecommendations(
          userId,
          userPrefs,
          serviceHistory
        );

      const emergencyPreventionRecommendations =
        await this.generateEmergencyPreventionRecommendations(
          userId,
          userPrefs,
          serviceHistory
        );

      recommendations.push(
        ...predictiveRecommendations,
        ...seasonalRecommendations,
        ...usageBasedRecommendations,
        ...emergencyPreventionRecommendations
      );

      // Filter out duplicates and low-confidence recommendations
      const filteredRecommendations = this.filterAndRankRecommendations(
        recommendations,
        userPrefs,
        activeServices
      );

      // Save recommendations to database
      await this.saveRecommendations(filteredRecommendations);

      console.log(
        `Generated ${filteredRecommendations.length} AI recommendations for user ${userId}`
      );
      return filteredRecommendations;
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      throw error;
    }
  }

  // Get user preferences or create default ones
  async getUserPreferences(userId) {
    let userPrefs = await UserPreference.findOne({ userId });

    if (!userPrefs) {
      // Create default preferences for new users
      userPrefs = new UserPreference({
        userId,
        servicePreferences: {
          preferredServices: [],
          budgetRanges: {
            emergency: { min: 0, max: 1000 },
            routine: { min: 0, max: 500 },
            upgrade: { min: 0, max: 2000 },
          },
          timePreferences: {
            preferredDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            preferredTimes: ["morning", "afternoon"],
            advanceNotice: 7,
          },
          communicationPreferences: {
            email: true,
            sms: false,
            push: true,
            frequency: "weekly",
          },
        },
        homeProfile: {
          homeType: "house",
          homeAge: 10,
          appliances: [],
        },
        behaviorProfile: {
          serviceFrequency: "moderate",
          maintenanceStyle: "reactive",
          riskTolerance: "medium",
        },
      });

      await userPrefs.save();
    }

    return userPrefs;
  }

  // Get user's service history
  async getServiceHistory(userId) {
    const [completed, requests] = await Promise.all([
      CompletedService.find({ serviceNeeder: userId })
        .sort({ completedAt: -1 })
        .limit(50)
        .populate("serviceRequest"),
      ServiceRequest.find({ serviceNeeder: userId })
        .sort({ createdAt: -1 })
        .limit(100),
    ]);

    return { completed, requests };
  }

  // Get active services
  async getActiveServices(userId) {
    return ActiveService.find({ serviceNeeder: userId }).populate(
      "serviceRequest"
    );
  }

  // Generate predictive maintenance recommendations
  async generatePredictiveMaintenanceRecommendations(
    userId,
    userPrefs,
    serviceHistory
  ) {
    const recommendations = [];
    const { completed } = serviceHistory;

    // Group completed services by type
    const servicesByType = {};
    completed.forEach((service) => {
      const serviceType = service.serviceRequest?.serviceCategory || "Other";
      if (!servicesByType[serviceType]) {
        servicesByType[serviceType] = [];
      }
      servicesByType[serviceType].push(service);
    });

    // Analyze patterns for each service type
    for (const [serviceType, services] of Object.entries(servicesByType)) {
      if (services.length >= 2) {
        const intervals = this.calculateServiceIntervals(services);
        const averageInterval =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const lastService = services[0];
        const daysSinceLastService = Math.floor(
          (Date.now() - new Date(lastService.completedAt)) /
            (1000 * 60 * 60 * 24)
        );

        // Predict next service need
        const expectedInterval =
          this.serviceLifespans[serviceType]?.min || averageInterval;
        const confidence = this.calculatePredictiveConfidence(
          intervals,
          serviceType
        );

        if (daysSinceLastService >= expectedInterval * 0.8) {
          // 80% of expected interval
          const predictedDate = new Date();
          predictedDate.setDate(
            predictedDate.getDate() +
              Math.max(7, expectedInterval - daysSinceLastService)
          );

          let priority = "medium";
          if (daysSinceLastService >= expectedInterval * 1.2) priority = "high";
          if (daysSinceLastService >= expectedInterval * 1.5)
            priority = "urgent";

          recommendations.push({
            userId,
            serviceType,
            recommendationType: "predictive_maintenance",
            priority,
            title: `${serviceType} Maintenance Due`,
            description: this.generatePredictiveDescription(
              serviceType,
              daysSinceLastService,
              averageInterval
            ),
            predictedDate,
            confidenceScore: confidence,
            reasons: [
              `Last ${serviceType.toLowerCase()} service was ${daysSinceLastService} days ago`,
              `Average interval between services: ${Math.round(
                averageInterval
              )} days`,
              `Recommended maintenance frequency: ${Math.round(
                expectedInterval
              )} days`,
            ],
            estimatedCost: this.estimateServiceCost(serviceType, userPrefs),
            relatedServiceHistory: services.slice(0, 3).map((s) => ({
              serviceId: s.serviceRequest?._id,
              completedAt: s.completedAt,
              serviceType: serviceType,
            })),
          });
        }
      }
    }

    return recommendations;
  }

  // Generate seasonal recommendations
  async generateSeasonalRecommendations(userId, userPrefs, serviceHistory) {
    const recommendations = [];
    const currentSeason = this.getCurrentSeason();
    const seasonalServices = this.seasonalServiceMappings[currentSeason] || [];
    const { completed } = serviceHistory;

    for (const serviceType of seasonalServices) {
      const lastSeasonalService = completed.find(
        (s) =>
          s.serviceRequest?.serviceCategory === serviceType &&
          this.isWithinSeasonalWindow(s.completedAt, currentSeason)
      );

      if (!lastSeasonalService) {
        const confidence = this.calculateSeasonalConfidence(
          serviceType,
          currentSeason,
          userPrefs
        );

        if (confidence >= 0.3) {
          const predictedDate = new Date();
          predictedDate.setDate(predictedDate.getDate() + 14); // 2 weeks from now

          recommendations.push({
            userId,
            serviceType,
            recommendationType: "seasonal_recommendation",
            priority: "medium",
            title: `Seasonal ${serviceType} Service`,
            description: this.generateSeasonalDescription(
              serviceType,
              currentSeason
            ),
            predictedDate,
            confidenceScore: confidence,
            reasons: [
              `${
                currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)
              } is the optimal time for ${serviceType.toLowerCase()}`,
              `No recent ${serviceType.toLowerCase()} service in your history`,
              `Weather and seasonal conditions favor this service type`,
            ],
            estimatedCost: this.estimateServiceCost(serviceType, userPrefs),
            locationFactors: {
              season: currentSeason,
              weather: this.getWeatherContext(),
              climate: userPrefs.homeProfile?.location?.climate || "temperate",
            },
          });
        }
      }
    }

    return recommendations;
  }

  // Generate usage-based recommendations
  async generateUsageBasedRecommendations(userId, userPrefs, serviceHistory) {
    const recommendations = [];
    const { completed, requests } = serviceHistory;

    // Analyze user's service patterns
    const serviceFrequency = this.analyzeServiceFrequency(completed);
    const preferredServices = this.identifyPreferredServices(
      completed,
      requests
    );

    for (const [serviceType, frequency] of Object.entries(serviceFrequency)) {
      if (frequency.count >= 3 && frequency.avgDaysBetween > 0) {
        const daysSinceLastService = frequency.daysSinceLast;
        const expectedNext = frequency.avgDaysBetween * 0.9; // 90% of average interval

        if (daysSinceLastService >= expectedNext) {
          const confidence = this.calculateUsageConfidence(
            frequency,
            userPrefs
          );

          if (confidence >= 0.4) {
            const predictedDate = new Date();
            predictedDate.setDate(predictedDate.getDate() + 7);

            recommendations.push({
              userId,
              serviceType,
              recommendationType: "usage_based",
              priority: "medium",
              title: `Regular ${serviceType} Service`,
              description: this.generateUsageBasedDescription(
                serviceType,
                frequency
              ),
              predictedDate,
              confidenceScore: confidence,
              reasons: [
                `You typically request ${serviceType.toLowerCase()} every ${Math.round(
                  frequency.avgDaysBetween
                )} days`,
                `It's been ${daysSinceLastService} days since your last service`,
                `Based on your usage patterns, you may need this service soon`,
              ],
              estimatedCost: this.estimateServiceCost(serviceType, userPrefs),
            });
          }
        }
      }
    }

    return recommendations;
  }

  // Generate emergency prevention recommendations
  async generateEmergencyPreventionRecommendations(
    userId,
    userPrefs,
    serviceHistory
  ) {
    const recommendations = [];
    const { completed } = serviceHistory;

    // Look for services that could prevent emergencies
    const riskAssessment = this.assessEmergencyRisks(completed, userPrefs);

    for (const risk of riskAssessment) {
      if (risk.riskLevel >= 0.6) {
        const predictedDate = new Date();
        predictedDate.setDate(
          predictedDate.getDate() + Math.max(3, 30 - risk.urgencyDays)
        );

        let priority = "medium";
        if (risk.riskLevel >= 0.8) priority = "high";
        if (risk.riskLevel >= 0.9) priority = "urgent";

        recommendations.push({
          userId,
          serviceType: risk.serviceType,
          recommendationType: "emergency_prevention",
          priority,
          title: `Prevent ${risk.emergencyType}`,
          description: risk.description,
          predictedDate,
          confidenceScore: risk.riskLevel,
          reasons: risk.reasons,
          estimatedCost: this.estimateServiceCost(risk.serviceType, userPrefs),
        });
      }
    }

    return recommendations;
  }

  // Helper methods
  calculateServiceIntervals(services) {
    const intervals = [];
    for (let i = 0; i < services.length - 1; i++) {
      const interval = Math.floor(
        (new Date(services[i].completedAt) -
          new Date(services[i + 1].completedAt)) /
          (1000 * 60 * 60 * 24)
      );
      if (interval > 0) intervals.push(interval);
    }
    return intervals;
  }

  calculatePredictiveConfidence(intervals, serviceType) {
    if (intervals.length < 2) return 0.3;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (acc, interval) => acc + Math.pow(interval - avgInterval, 2),
        0
      ) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher confidence
    const consistencyScore = Math.max(0, 1 - standardDeviation / avgInterval);

    // Service type reliability factor
    const reliabilityFactors = {
      HVAC: 0.9,
      Plumbing: 0.8,
      Cleaning: 0.9,
      "Pest Control": 0.8,
      "Appliance Repair": 0.7,
    };

    const reliability = reliabilityFactors[serviceType] || 0.6;

    return Math.min(0.95, consistencyScore * reliability);
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  }

  calculateSeasonalConfidence(serviceType, season, userPrefs) {
    const seasonalWeights = {
      HVAC: { spring: 0.8, summer: 0.9, fall: 0.8, winter: 0.7 },
      Landscaping: { spring: 0.9, summer: 0.8, fall: 0.7, winter: 0.2 },
      "Pest Control": { spring: 0.8, summer: 0.9, fall: 0.6, winter: 0.3 },
      Roofing: { spring: 0.7, summer: 0.5, fall: 0.8, winter: 0.4 },
    };

    const baseConfidence = seasonalWeights[serviceType]?.[season] || 0.5;

    // Adjust based on user's maintenance style
    const maintenanceBonus = {
      preventive: 0.2,
      proactive: 0.1,
      reactive: -0.1,
    };

    const style = userPrefs.behaviorProfile?.maintenanceStyle || "reactive";
    return Math.max(
      0.1,
      Math.min(0.9, baseConfidence + (maintenanceBonus[style] || 0))
    );
  }

  analyzeServiceFrequency(completedServices) {
    const frequency = {};

    completedServices.forEach((service) => {
      const serviceType = service.serviceRequest?.serviceCategory || "Other";
      if (!frequency[serviceType]) {
        frequency[serviceType] = {
          count: 0,
          dates: [],
          avgDaysBetween: 0,
          daysSinceLast: 0,
        };
      }

      frequency[serviceType].count++;
      frequency[serviceType].dates.push(new Date(service.completedAt));
    });

    // Calculate averages
    for (const [serviceType, data] of Object.entries(frequency)) {
      if (data.dates.length >= 2) {
        data.dates.sort((a, b) => b - a); // Most recent first

        const intervals = [];
        for (let i = 0; i < data.dates.length - 1; i++) {
          intervals.push(
            (data.dates[i] - data.dates[i + 1]) / (1000 * 60 * 60 * 24)
          );
        }

        data.avgDaysBetween =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;
        data.daysSinceLast = Math.floor(
          (Date.now() - data.dates[0]) / (1000 * 60 * 60 * 24)
        );
      }
    }

    return frequency;
  }

  calculateUsageConfidence(frequency, userPrefs) {
    let confidence = 0.4; // Base confidence

    // More frequent services = higher confidence
    if (frequency.count >= 5) confidence += 0.2;
    else if (frequency.count >= 3) confidence += 0.1;

    // Consistent intervals = higher confidence
    if (frequency.avgDaysBetween > 0) {
      const consistency = Math.min(
        1,
        30 / Math.abs(frequency.avgDaysBetween - 90)
      ); // Ideal ~90 days
      confidence += consistency * 0.2;
    }

    // User's maintenance style
    const style = userPrefs.behaviorProfile?.maintenanceStyle || "reactive";
    if (style === "preventive") confidence += 0.1;
    else if (style === "proactive") confidence += 0.05;

    return Math.min(0.9, confidence);
  }

  assessEmergencyRisks(completedServices, userPrefs) {
    const risks = [];
    const homeAge = userPrefs.homeProfile?.homeAge || 10;
    const appliances = userPrefs.homeProfile?.appliances || [];

    // HVAC system risk
    const hvacServices = completedServices.filter(
      (s) => s.serviceRequest?.serviceCategory === "HVAC"
    );

    if (hvacServices.length === 0 && homeAge > 5) {
      risks.push({
        serviceType: "HVAC",
        emergencyType: "System Failure",
        riskLevel: Math.min(0.9, 0.3 + homeAge * 0.05),
        urgencyDays: Math.max(7, 90 - homeAge * 2),
        description:
          "Your HVAC system may need maintenance to prevent costly emergency repairs.",
        reasons: [
          `Home is ${homeAge} years old`,
          "No recent HVAC maintenance in service history",
          "Preventive maintenance can avoid 80% of HVAC emergencies",
        ],
      });
    }

    // Plumbing risk for older homes
    const plumbingServices = completedServices.filter(
      (s) => s.serviceRequest?.serviceCategory === "Plumbing"
    );

    if (homeAge > 15 && plumbingServices.length === 0) {
      risks.push({
        serviceType: "Plumbing",
        emergencyType: "Pipe Burst or Major Leak",
        riskLevel: Math.min(0.8, 0.4 + (homeAge - 15) * 0.03),
        urgencyDays: 60,
        description:
          "Older plumbing systems benefit from regular inspections to prevent water damage.",
        reasons: [
          `Home is ${homeAge} years old`,
          "Plumbing systems typically need attention after 15+ years",
          "No recent plumbing service history",
        ],
      });
    }

    // Appliance risks
    appliances.forEach((appliance) => {
      const age = appliance.installDate
        ? Math.floor(
            (Date.now() - new Date(appliance.installDate)) /
              (1000 * 60 * 60 * 24 * 365)
          )
        : 5;

      if (
        age > 8 &&
        (!appliance.lastMaintenance ||
          Date.now() - new Date(appliance.lastMaintenance) >
            2 * 365 * 24 * 60 * 60 * 1000)
      ) {
        risks.push({
          serviceType: "Appliance Repair",
          emergencyType: `${appliance.type} Failure`,
          riskLevel: Math.min(0.7, 0.3 + age * 0.04),
          urgencyDays: 30,
          description: `Your ${appliance.type} may need maintenance to prevent unexpected breakdowns.`,
          reasons: [
            `${appliance.type} is ${age} years old`,
            "No recent maintenance recorded",
            "Regular maintenance extends appliance life by 40%",
          ],
        });
      }
    });

    return risks;
  }

  filterAndRankRecommendations(recommendations, userPrefs, activeServices) {
    // Remove duplicates
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) =>
        index ===
        self.findIndex(
          (r) =>
            r.serviceType === rec.serviceType &&
            r.recommendationType === rec.recommendationType
        )
    );

    // Filter out services that are already active
    const activeServiceTypes = activeServices.map(
      (s) => s.serviceRequest?.serviceCategory
    );
    const filteredRecommendations = uniqueRecommendations.filter(
      (rec) => !activeServiceTypes.includes(rec.serviceType)
    );

    // Apply user preferences filter
    const userFilteredRecommendations = filteredRecommendations.filter(
      (rec) => {
        if (!userPrefs.shouldReceiveRecommendation) return true;
        return userPrefs.shouldReceiveRecommendation(
          rec.serviceType,
          rec.priority
        );
      }
    );

    // Rank by urgency score and confidence
    return userFilteredRecommendations
      .filter((rec) => rec.confidenceScore >= 0.3) // Minimum confidence threshold
      .sort((a, b) => {
        const aUrgency = this.calculateUrgencyScore(a);
        const bUrgency = this.calculateUrgencyScore(b);
        return bUrgency - aUrgency;
      })
      .slice(0, 10); // Top 10 recommendations
  }

  calculateUrgencyScore(recommendation) {
    const priorityWeights = { low: 1, medium: 2, high: 3, urgent: 4 };
    const priorityWeight = priorityWeights[recommendation.priority] || 1;
    const daysUntil = Math.ceil(
      (new Date(recommendation.predictedDate) - new Date()) /
        (1000 * 60 * 60 * 24)
    );

    let urgencyScore = recommendation.confidenceScore * priorityWeight;

    if (daysUntil <= 0) urgencyScore *= 2;
    else if (daysUntil <= 7) urgencyScore *= 1.5;
    else if (daysUntil <= 30) urgencyScore *= 1.2;

    return Math.min(urgencyScore, 10);
  }

  async saveRecommendations(recommendations) {
    const savePromises = recommendations.map(async (recData) => {
      // Check if similar recommendation already exists
      const existing = await ServiceRecommendation.findOne({
        userId: recData.userId,
        serviceType: recData.serviceType,
        recommendationType: recData.recommendationType,
        isActive: true,
      });

      if (existing) {
        // Update existing recommendation
        Object.assign(existing, recData);
        return existing.save();
      } else {
        // Create new recommendation
        const recommendation = new ServiceRecommendation(recData);
        return recommendation.save();
      }
    });

    return Promise.all(savePromises);
  }

  // Description generators
  generatePredictiveDescription(serviceType, daysSince, avgInterval) {
    const descriptions = {
      HVAC: `Based on your service history, your HVAC system typically needs attention every ${Math.round(
        avgInterval
      )} days. It's been ${daysSince} days since your last service.`,
      Plumbing: `Regular plumbing maintenance helps prevent costly emergency repairs. Your average service interval is ${Math.round(
        avgInterval
      )} days.`,
      Cleaning: `Maintain a healthy home environment with regular cleaning services. You typically schedule cleaning every ${Math.round(
        avgInterval
      )} days.`,
      "Pest Control": `Preventive pest control is most effective when done regularly. Your typical service interval is ${Math.round(
        avgInterval
      )} days.`,
    };

    return (
      descriptions[serviceType] ||
      `Based on your service patterns, you may need ${serviceType.toLowerCase()} maintenance soon.`
    );
  }

  generateSeasonalDescription(serviceType, season) {
    const descriptions = {
      HVAC: {
        spring:
          "Spring is the perfect time for HVAC maintenance before the busy summer season.",
        summer:
          "Keep your cooling system running efficiently during peak summer months.",
        fall: "Prepare your heating system for the upcoming winter season.",
        winter:
          "Ensure your heating system is working optimally during cold weather.",
      },
      Landscaping: {
        spring:
          "Spring landscaping helps prepare your outdoor spaces for the growing season.",
        summer:
          "Summer maintenance keeps your landscape healthy and beautiful.",
        fall: "Fall cleanup and preparation protects your landscape through winter.",
        winter:
          "Winter landscaping focuses on protection and planning for next year.",
      },
    };

    return (
      descriptions[serviceType]?.[season] ||
      `${
        season.charAt(0).toUpperCase() + season.slice(1)
      } is a good time for ${serviceType.toLowerCase()} services.`
    );
  }

  generateUsageBasedDescription(serviceType, frequency) {
    return `Based on your service history, you typically request ${serviceType.toLowerCase()} every ${Math.round(
      frequency.avgDaysBetween
    )} days. It's been ${
      frequency.daysSinceLast
    } days since your last service.`;
  }

  estimateServiceCost(serviceType, userPrefs) {
    const baseCosts = {
      HVAC: { min: 150, max: 400 },
      Plumbing: { min: 100, max: 350 },
      Electrical: { min: 120, max: 300 },
      Cleaning: { min: 80, max: 200 },
      Landscaping: { min: 100, max: 250 },
      "Pest Control": { min: 80, max: 180 },
      "Appliance Repair": { min: 90, max: 250 },
      Carpentry: { min: 150, max: 400 },
      Painting: { min: 200, max: 500 },
      Roofing: { min: 300, max: 800 },
      Flooring: { min: 250, max: 600 },
      "Home Security": { min: 100, max: 300 },
    };

    const base = baseCosts[serviceType] || { min: 100, max: 250 };

    // Adjust based on user's budget preferences
    const userBudget = userPrefs.servicePreferences?.budgetRanges?.routine;
    if (userBudget) {
      return {
        min: Math.max(base.min, userBudget.min),
        max: Math.min(base.max, userBudget.max),
      };
    }

    return base;
  }

  isWithinSeasonalWindow(date, season) {
    const serviceDate = new Date(date);
    const currentYear = new Date().getFullYear();
    const seasonRanges = {
      spring: {
        start: new Date(currentYear, 2, 1),
        end: new Date(currentYear, 4, 31),
      },
      summer: {
        start: new Date(currentYear, 5, 1),
        end: new Date(currentYear, 7, 31),
      },
      fall: {
        start: new Date(currentYear, 8, 1),
        end: new Date(currentYear, 10, 30),
      },
      winter: {
        start: new Date(currentYear, 11, 1),
        end: new Date(currentYear + 1, 1, 31),
      },
    };

    const range = seasonRanges[season];
    return serviceDate >= range.start && serviceDate <= range.end;
  }

  identifyPreferredServices(completed, requests) {
    const serviceCounts = {};

    [...completed, ...requests].forEach((service) => {
      const serviceType =
        service.serviceRequest?.serviceCategory || service.serviceCategory;
      serviceCounts[serviceType] = (serviceCounts[serviceType] || 0) + 1;
    });

    return Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);
  }

  getWeatherContext() {
    // In a real implementation, this would call a weather API
    const seasons = ["mild", "hot", "cold", "rainy"];
    return seasons[Math.floor(Math.random() * seasons.length)];
  }
}

module.exports = AIRecommendationService;

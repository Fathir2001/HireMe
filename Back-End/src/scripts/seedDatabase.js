const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import all models
const ServiceNeeder = require("../models/ServiceNeeder");
const RequestedServiceProvider = require("../models/RequestedServiceProvider");
const ApprovedServiceProvider = require("../models/ApprovedServiceProvider");
const RejectedServiceProvider = require("../models/RejectedServiceProvider");
const ServiceRequest = require("../models/ServiceRequest");
const ServiceAccepted = require("../models/ServiceAccepted");
const ServiceRejected = require("../models/ServiceRejected");
const CompletedService = require("../models/CompletedService");
const ConnectedService = require("../models/ConnectedService");
const Notification = require("../models/Notification");
const SNNotification = require("../models/SNNotification");
const ServiceRecommendation = require("../models/ServiceRecommendation");
const UserPreference = require("../models/UserPreference");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hireme"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Helper function to generate random date within range
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to generate random phone number
const randomPhone = () => {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

// Sample data arrays
const serviceTypes = [
  "Electrical",
  "Plumbing",
  "HVAC",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Landscaping",
  "Roofing",
  "Appliance Repair",
  "Pest Control",
  "Home Security",
  "Flooring",
];

const locations = [
  "Downtown",
  "Suburbs",
  "North Side",
  "South Side",
  "East End",
  "West End",
  "City Center",
  "Riverside",
  "Hillside",
  "Industrial Area",
];

const availableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Sarah",
  "David",
  "Emma",
  "Chris",
  "Lisa",
  "Robert",
  "Maria",
  "James",
  "Anna",
  "William",
  "Jennifer",
  "Richard",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
];

// Generate Service Needers
const generateServiceNeeders = async () => {
  console.log("Creating Service Needers...");
  const serviceNeeders = [];

  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const serviceNeeder = new ServiceNeeder({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      password: await bcrypt.hash("password123", 10),
      phoneNumber: randomPhone(),
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    });

    serviceNeeders.push(serviceNeeder);
  }

  await ServiceNeeder.insertMany(serviceNeeders);
  console.log(`Created ${serviceNeeders.length} Service Needers`);
  return serviceNeeders;
};

// Generate Requested Service Providers
const generateRequestedServiceProviders = async () => {
  console.log("Creating Requested Service Providers...");
  const providers = [];

  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const provider = new RequestedServiceProvider({
      fullName: `${firstName} ${lastName}`,
      email: `provider${i}@email.com`,
      password: await bcrypt.hash("password123", 10),
      serviceType: [
        serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      ],
      phoneNumber: randomPhone(),
      serviceArea: locations[Math.floor(Math.random() * locations.length)],
      availableDays: availableDays.slice(0, Math.floor(Math.random() * 5) + 2),
      timeFrom: "08:00",
      timeTo: "18:00",
      experience: `${Math.floor(Math.random() * 10) + 1} years`,
      serviceFee: Math.floor(Math.random() * 80) + 20,
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    });

    providers.push(provider);
  }

  await RequestedServiceProvider.insertMany(providers);
  console.log(`Created ${providers.length} Requested Service Providers`);
  return providers;
};

// Generate Approved Service Providers
const generateApprovedServiceProviders = async () => {
  console.log("Creating Approved Service Providers...");
  const providers = [];

  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const provider = new ApprovedServiceProvider({
      fullName: `${firstName} ${lastName}`,
      email: `approved${i}@email.com`,
      password: await bcrypt.hash("password123", 10),
      serviceType: [
        serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      ],
      phoneNumber: randomPhone(),
      serviceArea: locations[Math.floor(Math.random() * locations.length)],
      availableDays: availableDays.slice(0, Math.floor(Math.random() * 5) + 2),
      timeFrom: ["08:00", "09:00", "10:00"][Math.floor(Math.random() * 3)],
      timeTo: ["17:00", "18:00", "19:00"][Math.floor(Math.random() * 3)],
      experience: `${Math.floor(Math.random() * 15) + 1} years`,
      serviceFee: Math.floor(Math.random() * 100) + 25,
      approvedAt: randomDate(new Date(2024, 0, 1), new Date()),
    });

    providers.push(provider);
  }

  await ApprovedServiceProvider.insertMany(providers);
  console.log(`Created ${providers.length} Approved Service Providers`);
  return providers;
};

// Generate Rejected Service Providers
const generateRejectedServiceProviders = async () => {
  console.log("Creating Rejected Service Providers...");
  const providers = [];

  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const provider = new RejectedServiceProvider({
      fullName: `${firstName} ${lastName}`,
      email: `rejected${i}@email.com`,
      serviceType: [
        serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      ],
      phoneNumber: randomPhone(),
      serviceArea: locations[Math.floor(Math.random() * locations.length)],
      availableDays: availableDays.slice(0, Math.floor(Math.random() * 5) + 2),
      timeFrom: "08:00",
      timeTo: "18:00",
      experience: `${Math.floor(Math.random() * 5) + 1} years`,
      serviceFee: Math.floor(Math.random() * 60) + 15,
      rejectedAt: randomDate(new Date(2024, 0, 1), new Date()),
    });

    providers.push(provider);
  }

  await RejectedServiceProvider.insertMany(providers);
  console.log(`Created ${providers.length} Rejected Service Providers`);
  return providers;
};

// Generate Service Requests
const generateServiceRequests = async (serviceNeeders, approvedProviders) => {
  console.log("Creating Service Requests...");
  const requests = [];

  for (let i = 0; i < 200; i++) {
    const serviceNeeder =
      serviceNeeders[Math.floor(Math.random() * serviceNeeders.length)];
    const provider =
      approvedProviders[Math.floor(Math.random() * approvedProviders.length)];
    const serviceType = provider.serviceType[0];
    const totalHours = Math.floor(Math.random() * 8) + 1;

    const request = new ServiceRequest({
      serviceNeeder: {
        id: serviceNeeder._id,
        name: serviceNeeder.name,
        phoneNumber: serviceNeeder.phoneNumber,
      },
      serviceProvider: {
        id: provider._id,
        name: provider.fullName,
        phoneNumber: provider.phoneNumber,
      },
      serviceDetails: {
        serviceType: serviceType,
        location: provider.serviceArea,
        address: `${Math.floor(Math.random() * 9999) + 1} Main St, ${
          provider.serviceArea
        }`,
        date: randomDate(new Date(), new Date(2025, 11, 31))
          .toISOString()
          .split("T")[0],
        timeFrom: "09:00",
        timeTo: `${9 + totalHours}:00`,
        totalHours: totalHours,
        feePerHour: provider.serviceFee,
        totalFee: totalHours * provider.serviceFee,
      },
      serviceType: serviceType,
      location: provider.serviceArea,
      address: `${Math.floor(Math.random() * 9999) + 1} Main St, ${
        provider.serviceArea
      }`,
      date: randomDate(new Date(), new Date(2025, 11, 31))
        .toISOString()
        .split("T")[0],
      timeFrom: "09:00",
      timeTo: `${9 + totalHours}:00`,
      totalHours: totalHours,
      totalFee: totalHours * provider.serviceFee,
      status: "pending",
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    });

    requests.push(request);
  }

  await ServiceRequest.insertMany(requests);
  console.log(`Created ${requests.length} Service Requests`);
  return requests;
};

// Generate Service Accepted
const generateServiceAccepted = async (serviceRequests) => {
  console.log("Creating Accepted Services...");
  const accepted = [];

  // Accept 60% of service requests
  const acceptedRequests = serviceRequests.slice(
    0,
    Math.floor(serviceRequests.length * 0.6)
  );

  for (const request of acceptedRequests) {
    const acceptedService = new ServiceAccepted({
      serviceNeeder: request.serviceNeeder,
      serviceProvider: request.serviceProvider,
      serviceDetails: request.serviceDetails,
      status: "accepted",
      originalRequestId: request._id,
      acceptedAt: randomDate(request.createdAt, new Date()),
    });

    accepted.push(acceptedService);
  }

  await ServiceAccepted.insertMany(accepted);
  console.log(`Created ${accepted.length} Accepted Services`);
  return accepted;
};

// Generate Service Rejected
const generateServiceRejected = async (serviceRequests) => {
  console.log("Creating Rejected Services...");
  const rejected = [];

  // Reject 20% of service requests
  const rejectedRequests = serviceRequests.slice(
    Math.floor(serviceRequests.length * 0.6),
    Math.floor(serviceRequests.length * 0.8)
  );

  for (const request of rejectedRequests) {
    const rejectedService = new ServiceRejected({
      serviceNeeder: request.serviceNeeder,
      serviceProvider: request.serviceProvider,
      serviceDetails: request.serviceDetails,
      status: "rejected",
      createdAt: randomDate(request.createdAt, new Date()),
    });

    rejected.push(rejectedService);
  }

  await ServiceRejected.insertMany(rejected);
  console.log(`Created ${rejected.length} Rejected Services`);
  return rejected;
};

// Generate Completed Services
const generateCompletedServices = async (acceptedServices) => {
  console.log("Creating Completed Services...");
  const completed = [];

  // Complete 70% of accepted services
  const completedServices = acceptedServices.slice(
    0,
    Math.floor(acceptedServices.length * 0.7)
  );

  for (const service of completedServices) {
    const startDate = randomDate(service.acceptedAt, new Date());
    const completedService = new CompletedService({
      serviceNeeder: service.serviceNeeder,
      serviceProvider: service.serviceProvider,
      serviceDetails: service.serviceDetails,
      originalServiceId: service._id,
      activeServiceId: new mongoose.Types.ObjectId(), // Mock active service ID
      startedAt: startDate,
      completedAt: randomDate(startDate, new Date()),
      status: "completed",
    });

    completed.push(completedService);
  }

  await CompletedService.insertMany(completed);
  console.log(`Created ${completed.length} Completed Services`);
  return completed;
};

// Generate Connected Services
const generateConnectedServices = async (acceptedServices) => {
  console.log("Creating Connected Services...");
  const connected = [];

  // Connect 30% of accepted services (those not yet completed)
  const connectedServices = acceptedServices.slice(
    Math.floor(acceptedServices.length * 0.7)
  );

  for (const service of connectedServices) {
    const connectedService = new ConnectedService({
      serviceNeeder: service.serviceNeeder,
      serviceProvider: service.serviceProvider,
      serviceDetails: service.serviceDetails,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      otpGeneratedAt: randomDate(service.acceptedAt, new Date()),
      originalServiceId: service._id,
      status: "connected",
      connectedAt: randomDate(service.acceptedAt, new Date()),
    });

    connected.push(connectedService);
  }

  await ConnectedService.insertMany(connected);
  console.log(`Created ${connected.length} Connected Services`);
  return connected;
};

// Generate Notifications
const generateNotifications = async (serviceRequests, approvedProviders) => {
  console.log("Creating Notifications...");
  const notifications = [];

  for (const request of serviceRequests) {
    const notification = new Notification({
      serviceProviderId: request.serviceProvider.id,
      serviceRequestId: request._id,
      serviceNeeder: request.serviceNeeder,
      serviceDetails: request.serviceDetails,
      message: `New service request for ${request.serviceDetails.serviceType} at ${request.serviceDetails.location}`,
      read: Math.random() > 0.3, // 70% read
      status: request.status,
      createdAt: request.createdAt,
    });

    notifications.push(notification);
  }

  await Notification.insertMany(notifications);
  console.log(`Created ${notifications.length} Notifications`);
  return notifications;
};

// Generate SN Notifications
const generateSNNotifications = async (
  serviceNeeders,
  acceptedServices,
  rejectedServices
) => {
  console.log("Creating Service Needer Notifications...");
  const snNotifications = [];

  // Notifications for accepted services
  for (const service of acceptedServices) {
    const notification = new SNNotification({
      serviceNeederId: service.serviceNeeder.id,
      serviceRequestId: service.originalRequestId,
      serviceProvider: service.serviceProvider,
      message: `Your service request for ${service.serviceDetails.serviceType} has been accepted by ${service.serviceProvider.name}`,
      read: Math.random() > 0.4, // 60% read
      status: "accepted",
      createdAt: service.acceptedAt,
    });

    snNotifications.push(notification);
  }

  // Notifications for rejected services
  for (const service of rejectedServices) {
    const notification = new SNNotification({
      serviceNeederId: service.serviceNeeder.id,
      serviceRequestId: new mongoose.Types.ObjectId(), // Mock request ID
      serviceProvider: service.serviceProvider,
      message: `Your service request for ${service.serviceDetails.serviceType} has been rejected by ${service.serviceProvider.name}`,
      read: Math.random() > 0.5, // 50% read
      status: "rejected",
      createdAt: service.createdAt,
    });

    snNotifications.push(notification);
  }

  await SNNotification.insertMany(snNotifications);
  console.log(`Created ${snNotifications.length} Service Needer Notifications`);
  return snNotifications;
};

// Generate AI Service Recommendations
const generateServiceRecommendations = async (
  serviceNeeders,
  approvedProviders
) => {
  console.log("Creating AI Service Recommendations...");
  const recommendations = [];

  const recommendationTypes = [
    "predictive_maintenance",
    "seasonal_recommendation",
    "usage_based",
    "emergency_prevention",
  ];
  const reasons = {
    predictive_maintenance: [
      "Your HVAC system shows signs of wear based on usage patterns",
      "Plumbing maintenance overdue based on last service date",
      "Electrical inspection recommended for safety compliance",
      "Regular maintenance prevents costly emergency repairs",
    ],
    seasonal_recommendation: [
      "Winter is approaching - heating system maintenance recommended",
      "Spring cleaning services typically needed this time of year",
      "Summer AC tune-up prevents breakdown during hot weather",
      "Fall gutter cleaning before winter weather arrives",
    ],
    usage_based: [
      "You typically book plumbing services every 6 months",
      "Based on your history, you prefer weekend appointments",
      "Similar users often need this service after recent bookings",
      "Your service pattern suggests upcoming maintenance needs",
    ],
    emergency_prevention: [
      "Potential electrical hazard detected - immediate attention needed",
      "Water damage risk identified in basement area",
      "Gas leak prevention inspection urgently recommended",
      "Structural safety concern requires professional assessment",
    ],
  };

  for (const serviceNeeder of serviceNeeders) {
    // Generate 2-5 recommendations per user
    const numRecommendations = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numRecommendations; i++) {
      const recommendationType =
        recommendationTypes[
          Math.floor(Math.random() * recommendationTypes.length)
        ];
      const serviceType =
        serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const provider =
        approvedProviders[Math.floor(Math.random() * approvedProviders.length)];
      const reasonOptions = reasons[recommendationType];
      const reason =
        reasonOptions[Math.floor(Math.random() * reasonOptions.length)];

      // Emergency prevention has higher confidence and priority
      const baseConfidence =
        recommendationType === "emergency_prevention" ? 0.85 : 0.65;
      const confidence = baseConfidence + Math.random() * 0.15;

      const priority =
        recommendationType === "emergency_prevention"
          ? "urgent"
          : confidence > 0.8
          ? "high"
          : confidence > 0.65
          ? "medium"
          : "low";

      const recommendation = new ServiceRecommendation({
        userId: serviceNeeder._id,
        serviceType: serviceType,
        recommendationType: recommendationType,
        priority: priority,
        title: `${serviceType} ${recommendationType
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}`,
        description: reason,
        predictedDate: randomDate(
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        ),
        confidenceScore: Math.round(confidence * 100) / 100,
        reasons: [reason],
        estimatedCost: {
          min: Math.floor(Math.random() * 100) + 50,
          max: Math.floor(Math.random() * 200) + 150,
        },
        suggestedProviders: [
          {
            providerId: provider._id,
            name: provider.fullName,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
            serviceFee: provider.serviceFee,
          },
        ],
        isActive: true,
        isAccepted: false,
        isDismissed: Math.random() > 0.8, // 20% dismissed
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        updatedAt: randomDate(new Date(2024, 0, 1), new Date()),
      });

      recommendations.push(recommendation);
    }
  }

  await ServiceRecommendation.insertMany(recommendations);
  console.log(`Created ${recommendations.length} AI Service Recommendations`);
  return recommendations;
};

// Generate User Preferences
const generateUserPreferences = async (serviceNeeders) => {
  console.log("Creating User Preferences...");
  const preferences = [];

  for (const serviceNeeder of serviceNeeders) {
    // Create random preferences for each user
    const servicePreferences = {};
    serviceTypes.forEach((serviceType) => {
      servicePreferences[serviceType.replace(/\s+/g, "")] = {
        importance: Math.floor(Math.random() * 5) + 1, // 1-5
        frequency: ["weekly", "monthly", "quarterly", "yearly"][
          Math.floor(Math.random() * 4)
        ],
        budgetRange: {
          min: Math.floor(Math.random() * 100) + 20,
          max: Math.floor(Math.random() * 300) + 100,
        },
      };
    });

    const preference = new UserPreference({
      userId: serviceNeeder._id,
      homeProfile: {
        homeType: ["apartment", "house", "condo", "townhouse"][
          Math.floor(Math.random() * 4)
        ],
        homeAge: Math.floor(Math.random() * 50) + 1,
        homeSize: {
          squareFeet: Math.floor(Math.random() * 3000) + 500,
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 3) + 1,
        },
        location: {
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          climate: ["tropical", "dry", "temperate", "continental"][
            Math.floor(Math.random() * 4)
          ],
          environment: ["urban", "suburban", "rural"][
            Math.floor(Math.random() * 3)
          ],
        },
      },
      behaviorProfile: {
        serviceFrequency: ["very_low", "low", "moderate", "high"][
          Math.floor(Math.random() * 4)
        ],
        maintenanceStyle: ["reactive", "proactive", "preventive"][
          Math.floor(Math.random() * 3)
        ],
        riskTolerance: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        techSavviness: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        pricesensitivity: ["low", "medium", "high"][
          Math.floor(Math.random() * 3)
        ],
      },
      notificationSettings: {
        recommendations: {
          enabled: Math.random() > 0.2, // 80% enabled
          frequency: ["immediate", "daily", "weekly"][
            Math.floor(Math.random() * 3)
          ],
          types: [
            "predictive_maintenance",
            "seasonal_recommendation",
            "usage_based",
          ],
        },
        reminders: {
          enabled: Math.random() > 0.3, // 70% enabled
          advance: Math.floor(Math.random() * 14) + 1, // 1-14 days
        },
        emergencyAlerts: {
          enabled: Math.random() > 0.1, // 90% enabled
          urgentOnly: Math.random() > 0.7, // 30% urgent only
        },
      },
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      updatedAt: randomDate(new Date(2024, 0, 1), new Date()),
    });

    preferences.push(preference);
  }

  await UserPreference.insertMany(preferences);
  console.log(`Created ${preferences.length} User Preferences`);
  return preferences;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await Promise.all([
      ServiceNeeder.deleteMany({}),
      RequestedServiceProvider.deleteMany({}),
      ApprovedServiceProvider.deleteMany({}),
      RejectedServiceProvider.deleteMany({}),
      ServiceRequest.deleteMany({}),
      ServiceAccepted.deleteMany({}),
      ServiceRejected.deleteMany({}),
      CompletedService.deleteMany({}),
      ConnectedService.deleteMany({}),
      Notification.deleteMany({}),
      SNNotification.deleteMany({}),
      ServiceRecommendation.deleteMany({}),
      UserPreference.deleteMany({}),
    ]);

    console.log("Starting database seeding...");

    // Generate data in sequence (due to dependencies)
    const serviceNeeders = await generateServiceNeeders();
    const requestedProviders = await generateRequestedServiceProviders();
    const approvedProviders = await generateApprovedServiceProviders();
    const rejectedProviders = await generateRejectedServiceProviders();

    const serviceRequests = await generateServiceRequests(
      serviceNeeders,
      approvedProviders
    );
    const acceptedServices = await generateServiceAccepted(serviceRequests);
    const rejectedServices = await generateServiceRejected(serviceRequests);

    const completedServices = await generateCompletedServices(acceptedServices);
    const connectedServices = await generateConnectedServices(acceptedServices);

    const notifications = await generateNotifications(
      serviceRequests,
      approvedProviders
    );
    const snNotifications = await generateSNNotifications(
      serviceNeeders,
      acceptedServices,
      rejectedServices
    );

    // Generate AI data
    const serviceRecommendations = await generateServiceRecommendations(
      serviceNeeders,
      approvedProviders
    );
    const userPreferences = await generateUserPreferences(serviceNeeders);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`✅ Service Needers: ${serviceNeeders.length}`);
    console.log(`✅ Requested Providers: ${requestedProviders.length}`);
    console.log(`✅ Approved Providers: ${approvedProviders.length}`);
    console.log(`✅ Rejected Providers: ${rejectedProviders.length}`);
    console.log(`✅ Service Requests: ${serviceRequests.length}`);
    console.log(`✅ Accepted Services: ${acceptedServices.length}`);
    console.log(`✅ Rejected Services: ${rejectedServices.length}`);
    console.log(`✅ Completed Services: ${completedServices.length}`);
    console.log(`✅ Connected Services: ${connectedServices.length}`);
    console.log(`✅ Notifications: ${notifications.length}`);
    console.log(`✅ SN Notifications: ${snNotifications.length}`);
    console.log(
      `🤖 AI Service Recommendations: ${serviceRecommendations.length}`
    );
    console.log(`⚙️ User Preferences: ${userPreferences.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();

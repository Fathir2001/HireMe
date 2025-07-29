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
  "Electrical Work",
  "Plumbing",
  "HVAC",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Landscaping",
  "Roofing",
  "Appliance Repair",
  "Handyman Services",
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

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();

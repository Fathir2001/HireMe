const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const requestedServiceProviderRoutes = require("./routes/requestedServiceProvider.js");
const adminRoutes = require("./routes/adminRoutes");
const serviceNeederRoutes = require("./routes/serviceNeederRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authMiddleware = require("./middleware/auth");
const { createTransport } = require("nodemailer");
const adminServiceRoutes = require("./routes/adminServiceRoutes");
const ConnectedService = require("./models/ConnectedService");
const {
  checkServiceActivation,
  checkServiceCompletion,
} = require("./controllers/activeServiceController");

// Set up periodic checks (every minute)
setInterval(() => {
  // Check for services to activate
  checkServiceActivation();

  // Check for services to complete
  checkServiceCompletion();
}, 60000);

// Load environment variables
dotenv.config();
const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "https://hireme-f.netlify.app",
        ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://hireme-f.netlify.app",
      ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Make io available in routes
app.set("io", io);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to HireMe API",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Health check route for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Admin seeding route (remove in production)
app.get("/seed-admin", async (req, res) => {
  try {
    const Admin = require("./models/admin");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@HireMe.com" });
    if (existingAdmin) {
      return res.json({
        message: "Admin user already exists",
        email: "admin@HireMe.com",
      });
    }

    // Create admin user
    const adminData = {
      email: "admin@HireMe.com",
      password: "admin123", // This will be hashed automatically
    };

    const admin = new Admin(adminData);
    await admin.save();

    res.json({
      message: "Admin user created successfully",
      email: adminData.email,
      defaultPassword: "admin123 (please change after first login)",
    });
  } catch (error) {
    console.error("Error seeding admin:", error);
    res.status(500).json({
      error: "Failed to seed admin user",
      message: error.message,
    });
  }
});

// API Routes
app.use("/api/service-providers", requestedServiceProviderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/service-needers", serviceNeederRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/service-requests", adminServiceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.set("io", io);

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Custom event listeners here if needed
  socket.on("requestOTP", (data) => {
    console.log("OTP requested for service:", data.serviceId);
  });

  socket.on("verifyOTP", (data) => {
    console.log("OTP verification for service:", data.serviceId);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Verify email configuration on startup
const verifyEmailConfig = async () => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn(
        "⚠️  Email credentials not configured. Email functionality will be disabled."
      );
      console.warn(
        "   Please set EMAIL_USER and EMAIL_PASS environment variables to enable email features."
      );
      return;
    }

    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Email configuration verified successfully");
  } catch (error) {
    console.error("❌ Email configuration error:", {
      message: error.message,
      code: error.code,
    });
    console.error("📧 Email troubleshooting tips:");
    console.error(
      "   1. Make sure 2-Factor Authentication is enabled on your Gmail account"
    );
    console.error(
      "   2. Generate a new App Password: https://myaccount.google.com/apppasswords"
    );
    console.error(
      "   3. Use the App Password (not your regular Gmail password) in EMAIL_PASS"
    );
    console.error(
      "   4. App Password format should be: 'xxxx xxxx xxxx xxxx' (with spaces)"
    );
  }
};

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await verifyEmailConfig();
});

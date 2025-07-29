// API Testing Script for AI Recommendations
const https = require("http");

const API_BASE = "http://localhost:5000/api/ai-recommendations";

// Test function to make HTTP requests
const testEndpoint = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/api/ai-recommendations${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Get a random user ID from database for testing
const getRandomUserId = async () => {
  const mongoose = require("mongoose");
  require("dotenv").config();

  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hireme"
    );
    const ServiceNeeder = require("../models/ServiceNeeder");
    const users = await ServiceNeeder.find().limit(5);
    await mongoose.disconnect();

    if (users.length > 0) {
      return users[0]._id.toString();
    }
    return null;
  } catch (error) {
    console.error("Error getting user ID:", error.message);
    return null;
  }
};

// Main testing function
const runAPITests = async () => {
  console.log("🧪 Starting AI Recommendation API Tests...\n");

  // Get a test user ID
  const userId = await getRandomUserId();
  if (!userId) {
    console.error("❌ Could not get test user ID");
    return;
  }

  console.log(`📝 Using test user ID: ${userId}\n`);

  const tests = [
    {
      name: "Get User Recommendations",
      method: "GET",
      path: `/user/${userId}`,
      expectedStatus: 200,
    },
    {
      name: "Get User Preferences",
      method: "GET",
      path: `/preferences/${userId}`,
      expectedStatus: 200,
    },
    {
      name: "Generate New Recommendations",
      method: "POST",
      path: "/generate",
      expectedStatus: 200,
    },
    {
      name: "Get System Analytics",
      method: "GET",
      path: "/analytics",
      expectedStatus: 200,
    },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   ${test.method} ${test.path}`);

      const result = await testEndpoint(test.method, test.path, test.data);

      if (result.status === test.expectedStatus) {
        console.log(`   ✅ PASSED (Status: ${result.status})`);

        // Show sample data for successful requests
        if (result.data && typeof result.data === "object") {
          if (
            test.name.includes("Recommendations") &&
            result.data.recommendations
          ) {
            console.log(
              `   📊 Found ${result.data.recommendations.length} recommendations`
            );
            if (result.data.recommendations.length > 0) {
              const sample = result.data.recommendations[0];
              console.log(
                `   📝 Sample: ${sample.serviceType} - ${
                  sample.priority
                } priority (${Math.round(
                  sample.confidenceScore * 100
                )}% confidence)`
              );
            }
          } else if (
            test.name.includes("Preferences") &&
            result.data.preferences
          ) {
            console.log(`   ⚙️ Preferences loaded successfully`);
            console.log(
              `   🏠 Home type: ${
                result.data.preferences.homeProfile?.homeType || "Not set"
              }`
            );
          } else if (test.name.includes("Analytics") && result.data.analytics) {
            console.log(`   📈 Analytics data available`);
            console.log(
              `   📊 Total recommendations: ${
                result.data.analytics.totalRecommendations || 0
              }`
            );
          } else if (test.name.includes("Generate")) {
            console.log(
              `   🤖 Generated ${
                result.data.generatedCount || 0
              } new recommendations`
            );
          }
        }

        passedTests++;
      } else {
        console.log(
          `   ❌ FAILED (Expected: ${test.expectedStatus}, Got: ${result.status})`
        );
        if (result.data && result.data.message) {
          console.log(`   💬 Error: ${result.data.message}`);
        }
      }

      console.log(""); // Empty line for readability
    } catch (error) {
      console.log(`   ❌ FAILED (Network Error: ${error.message})`);
      console.log("");
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log(
      "🎉 All API tests passed! AI Recommendation system is working correctly."
    );
  } else {
    console.log(
      "⚠️  Some tests failed. Please check the server logs and database connection."
    );
  }

  console.log("\n💡 Next steps:");
  console.log("   1. Start the backend server: npm run dev");
  console.log("   2. Start the frontend: npm run dev (in root directory)");
  console.log(
    "   3. Navigate to: http://localhost:5173/service-needer/ai-recommendations"
  );
  console.log("   4. Test the complete user interface");
};

// Export for use
module.exports = { runAPITests, testEndpoint };

// Run tests if called directly
if (require.main === module) {
  runAPITests().catch(console.error);
}

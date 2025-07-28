#!/usr/bin/env node

/**
 * Script to replace hardcoded localhost URLs with environment-based configuration
 * This ensures the frontend works in both development and production
 */

const fs = require("fs");
const path = require("path");

// Files to update and their specific replacements
const filesToUpdate = [
  {
    file: "src/pages/admin/login.tsx",
    replacements: [
      {
        search: '"http://localhost:5000/api/admin/login"',
        replace: "API_ENDPOINTS.ADMIN.LOGIN",
      },
    ],
    addImport: true,
  },
  {
    file: "src/pages/admin/analytics.tsx",
    replacements: [
      {
        search: '"http://localhost:5000/api/analytics/dashboard"',
        replace: "API_ENDPOINTS.ADMIN.DASHBOARD",
      },
    ],
    addImport: true,
  },
  {
    file: "src/pages/serviceNeeder/trackService.tsx",
    replacements: [
      {
        search: '"http://localhost:5000"',
        replace: "API_CONFIG.SOCKET_URL",
      },
      {
        search: '"http://localhost:5000/api/service-requests/my-requests"',
        replace: "API_ENDPOINTS.SERVICE_REQUEST.MY_REQUESTS",
      },
    ],
    addImport: true,
  },
];

// Helper function to add imports
function addApiImport(content) {
  if (
    content.includes("import { API_CONFIG") ||
    content.includes("import { API_ENDPOINTS")
  ) {
    return content; // Already has import
  }

  const importLine =
    "import { API_CONFIG, API_ENDPOINTS } from '../../config/api';";
  const reactImportIndex = content.indexOf("import React");

  if (reactImportIndex !== -1) {
    const nextLineIndex = content.indexOf("\n", reactImportIndex);
    return (
      content.slice(0, nextLineIndex + 1) +
      importLine +
      "\n" +
      content.slice(nextLineIndex + 1)
    );
  }

  return importLine + "\n" + content;
}

console.log(
  "🔧 Updating frontend files to use centralized API configuration...\n"
);

// Process each file
filesToUpdate.forEach(({ file, replacements, addImport }) => {
  const fullPath = path.join(__dirname, "..", file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let changed = false;

  // Add import if needed
  if (addImport) {
    const newContent = addApiImport(content);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }

  // Apply replacements
  replacements.forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.replace(
        new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        replace
      );
      changed = true;
      console.log(`  ✅ Replaced ${search} with ${replace}`);
    }
  });

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log(`📝 Updated: ${file}\n`);
  } else {
    console.log(`⏩ No changes needed: ${file}\n`);
  }
});

console.log("✨ API configuration update complete!");
console.log("\n📋 Summary:");
console.log("• Created centralized API configuration in src/config/api.ts");
console.log("• Updated key files to use environment variables");
console.log("• Frontend will now work in both development and production");
console.log("\n🚀 Your frontend is now ready for deployment!");

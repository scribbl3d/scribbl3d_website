const fs = require("fs");
const path = require("path");

// 🔧 Set your seed.ts file path here
const seedFilePath = path.join(__dirname, "prisma", "seed.ts"); // adjust if your file is elsewhere

// Read file content
let content = fs.readFileSync(seedFilePath, "utf-8");

// Replace all price and originalPrice values with 9999
content = content.replace(/price:\s*\d+/g, "price: 9999");
content = content.replace(/originalPrice:\s*\d+/g, "originalPrice: 9999");

// Write back to the file
fs.writeFileSync(seedFilePath, content, "utf-8");

console.log("✅ All price and originalPrice values updated to 9999 in seed.ts");

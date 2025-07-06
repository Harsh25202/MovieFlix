const fs = require("fs")
const path = require("path")

console.log("🔍 Environment Variable Checker\n")

// Check which .env files exist
const envFiles = [".env.local", ".env.development", ".env"]
const existingFiles = []

envFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    existingFiles.push(file)
    console.log(`✅ Found: ${file}`)
  } else {
    console.log(`❌ Missing: ${file}`)
  }
})

if (existingFiles.length === 0) {
  console.log("\n❌ No environment files found!")
  console.log("Create a .env.local file with your MongoDB credentials")
  process.exit(1)
}

// Load environment variables
require("dotenv").config({ path: ".env.local" })

console.log("\n📋 Current Environment Variables:")
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? "✅ Set" : "❌ Not set"}`)
console.log(`MONGODB_DB_NAME: ${process.env.MONGODB_DB_NAME || "❌ Not set"}`)
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Set" : "❌ Not set"}`)

if (process.env.MONGODB_URI) {
  // Hide password in output
  const sanitizedUri = process.env.MONGODB_URI.replace(/\/\/.*:.*@/, "//***:***@")
  console.log(`\n🔗 MongoDB URI: ${sanitizedUri}`)
}

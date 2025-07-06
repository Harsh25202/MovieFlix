const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

console.log("🔐 Generating JWT Secret...\n")

// Generate a secure random secret
const jwtSecret = crypto.randomBytes(64).toString("hex")

console.log("Generated JWT Secret:")
console.log(jwtSecret)
console.log("\n📋 Copy this secret and add it to your environment variables:")
console.log(`JWT_SECRET=${jwtSecret}`)

// Try to update .env.local if it exists
const envPath = path.join(process.cwd(), ".env.local")

if (fs.existsSync(envPath)) {
  console.log("\n📝 Updating .env.local file...")

  let envContent = fs.readFileSync(envPath, "utf8")

  // Update or add JWT_SECRET
  if (envContent.includes("JWT_SECRET=")) {
    envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`)
  } else {
    envContent += `\nJWT_SECRET=${jwtSecret}\n`
  }

  // Write back to file
  fs.writeFileSync(envPath, envContent)
  console.log("✅ JWT_SECRET has been added to .env.local")
} else {
  console.log("\n📝 Create a .env.local file with:")
  console.log(`MONGODB_URI=mongodb://localhost:27017/movieflix`)
  console.log(`MONGODB_DB_NAME=movieflix`)
  console.log(`JWT_SECRET=${jwtSecret}`)
}

console.log("\n🚀 For production deployment, add this JWT_SECRET to your hosting platform's environment variables.")
console.log("\n⚠️  Keep this secret secure and never commit it to version control!")

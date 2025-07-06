const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up MovieFlix development environment...\n")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.log("📝 Creating .env.local file...")
  const envExample = fs.readFileSync(path.join(process.cwd(), ".env.example"), "utf8")
  fs.writeFileSync(envPath, envExample)
  console.log("✅ .env.local created successfully!\n")
} else {
  console.log("✅ .env.local already exists\n")
}

console.log("📋 Setup checklist:")
console.log("1. ✅ Environment file created")
console.log("2. 🔧 Install MongoDB locally")
console.log("3. 🌱 Run database seeding: npm run seed")
console.log("4. 🚀 Start development server: npm run dev:https")
console.log("\n🎬 Your MovieFlix app will be ready at https://localhost:3000")

// Interactive JWT testing script
const { generateJWT, verifyJWT } = require("./generate-jwt-token")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function main() {
  console.log("🧪 Interactive JWT Token Tester\n")

  const jwtSecret = process.env.JWT_SECRET || "default-secret-key-change-in-production"

  if (!process.env.JWT_SECRET) {
    console.log("⚠️  Warning: Using default JWT_SECRET. Set JWT_SECRET environment variable.\n")
  }

  while (true) {
    console.log("\nChoose an option:")
    console.log("1. Generate new JWT token")
    console.log("2. Verify existing JWT token")
    console.log("3. Exit")

    const choice = await askQuestion("\nEnter your choice (1-3): ")

    switch (choice) {
      case "1":
        await generateNewToken(jwtSecret)
        break
      case "2":
        await verifyExistingToken(jwtSecret)
        break
      case "3":
        console.log("👋 Goodbye!")
        rl.close()
        return
      default:
        console.log("❌ Invalid choice. Please enter 1, 2, or 3.")
    }
  }
}

async function generateNewToken(secret) {
  console.log("\n📝 Enter user details:")

  const userId = await askQuestion("User ID: ")
  const name = await askQuestion("Name: ")
  const email = await askQuestion("Email: ")

  if (!userId || !name || !email) {
    console.log("❌ All fields are required!")
    return
  }

  const payload = { userId, name, email }
  const token = generateJWT(payload, secret)

  console.log("\n✅ JWT Token Generated:")
  console.log(`Token: ${token}`)
  console.log(`Length: ${token.length} characters`)

  // Show decoded payload
  const verification = verifyJWT(token, secret)
  if (verification.valid) {
    console.log("\n📋 Token Payload:")
    console.log(JSON.stringify(verification.payload, null, 2))
    console.log(`\n⏰ Expires: ${new Date(verification.payload.exp * 1000).toLocaleString()}`)
  }
}

async function verifyExistingToken(secret) {
  console.log("\n🔍 Token Verification:")

  const token = await askQuestion("Enter JWT token to verify: ")

  if (!token) {
    console.log("❌ Token is required!")
    return
  }

  const verification = verifyJWT(token, secret)

  if (verification.valid) {
    console.log("\n✅ Token is VALID")
    console.log("\n📋 Decoded Payload:")
    console.log(JSON.stringify(verification.payload, null, 2))
    console.log(`\n⏰ Expires: ${new Date(verification.payload.exp * 1000).toLocaleString()}`)

    // Check if token is about to expire
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = verification.payload.exp - now
    const hoursLeft = Math.floor(timeLeft / 3600)
    const daysLeft = Math.floor(hoursLeft / 24)

    if (daysLeft > 1) {
      console.log(`⏳ Token expires in ${daysLeft} days`)
    } else if (hoursLeft > 1) {
      console.log(`⏳ Token expires in ${hoursLeft} hours`)
    } else {
      console.log("⚠️  Token expires soon!")
    }
  } else {
    console.log("\n❌ Token is INVALID")
    console.log(`Error: ${verification.error}`)
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

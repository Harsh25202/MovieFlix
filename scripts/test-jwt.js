// Interactive JWT Testing Script
// Run with: node scripts/test-jwt.js

const crypto = require("crypto")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// JWT utilities
function base64urlEncode(str) {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64urlDecode(str) {
  str += "=".repeat((4 - (str.length % 4)) % 4)
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(str, "base64").toString()
}

function createJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")

  return `${data}.${signature}`
}

function verifyJWT(token, secret) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    if (expectedSignature !== encodedSignature) return null

    const payload = JSON.parse(base64urlDecode(encodedPayload))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch (error) {
    return null
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const header = JSON.parse(base64urlDecode(parts[0]))
    const payload = JSON.parse(base64urlDecode(parts[1]))

    return { header, payload }
  } catch (error) {
    return null
  }
}

// Interactive menu
function showMenu() {
  console.log("\n🔐 JWT Testing Menu:")
  console.log("1. Generate JWT Token")
  console.log("2. Verify JWT Token")
  console.log("3. Decode JWT Token (without verification)")
  console.log("4. Generate JWT Secret")
  console.log("5. Exit")
  console.log("")
}

function generateToken() {
  rl.question("Enter user ID: ", (userId) => {
    rl.question("Enter name: ", (name) => {
      rl.question("Enter email: ", (email) => {
        const secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex")
        const token = createJWT({ userId, name, email }, secret)

        console.log("\n✅ Generated JWT Token:")
        console.log(`Token: ${token}`)
        console.log(`Length: ${token.length} characters`)
        console.log(`Secret used: ${secret}`)

        showMenu()
        handleChoice()
      })
    })
  })
}

function verifyToken() {
  rl.question("Enter JWT token: ", (token) => {
    rl.question("Enter JWT secret (or press Enter to use env): ", (secret) => {
      const jwtSecret = secret || process.env.JWT_SECRET || "default-secret"
      const payload = verifyJWT(token, jwtSecret)

      if (payload) {
        console.log("\n✅ Token is valid!")
        console.log("Payload:", JSON.stringify(payload, null, 2))
        console.log(`Expires: ${new Date(payload.exp * 1000).toLocaleString()}`)
      } else {
        console.log("\n❌ Token is invalid or expired")
      }

      showMenu()
      handleChoice()
    })
  })
}

function decodeToken() {
  rl.question("Enter JWT token: ", (token) => {
    const decoded = decodeJWT(token)

    if (decoded) {
      console.log("\n📋 Decoded JWT Token:")
      console.log("Header:", JSON.stringify(decoded.header, null, 2))
      console.log("Payload:", JSON.stringify(decoded.payload, null, 2))

      if (decoded.payload.exp) {
        const isExpired = decoded.payload.exp < Math.floor(Date.now() / 1000)
        console.log(`Status: ${isExpired ? "❌ Expired" : "✅ Valid"}`)
        console.log(`Expires: ${new Date(decoded.payload.exp * 1000).toLocaleString()}`)
      }
    } else {
      console.log("\n❌ Invalid JWT token format")
    }

    showMenu()
    handleChoice()
  })
}

function generateSecret() {
  const secret = crypto.randomBytes(32).toString("hex")
  console.log("\n🔑 Generated JWT Secret:")
  console.log(secret)
  console.log("\n💡 Add this to your .env.local file:")
  console.log(`JWT_SECRET=${secret}`)

  showMenu()
  handleChoice()
}

function handleChoice() {
  rl.question("Choose an option (1-5): ", (choice) => {
    switch (choice) {
      case "1":
        generateToken()
        break
      case "2":
        verifyToken()
        break
      case "3":
        decodeToken()
        break
      case "4":
        generateSecret()
        break
      case "5":
        console.log("👋 Goodbye!")
        rl.close()
        break
      default:
        console.log("❌ Invalid choice. Please try again.")
        showMenu()
        handleChoice()
        break
    }
  })
}

// Start the interactive session
console.log("🎬 MovieFlix JWT Testing Tool")
console.log("=============================")

if (process.env.JWT_SECRET) {
  console.log("✅ JWT_SECRET found in environment")
} else {
  console.log("⚠️  JWT_SECRET not found in environment")
}

showMenu()
handleChoice()

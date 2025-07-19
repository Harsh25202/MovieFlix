// JWT Token Generator Script for MovieFlix
// Run with: node scripts/generate-jwt-token.js

const crypto = require("crypto")

// Simple JWT implementation for Node.js (for script use only)
function base64urlEncode(str) {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function createJWT(payload, secret) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

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

function generateJWTSecret() {
  return crypto.randomBytes(32).toString("hex")
}

// Main function
function main() {
  console.log("🔐 JWT Token Generator for MovieFlix\n")

  // Check for JWT_SECRET
  let jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.log("⚠️  JWT_SECRET not found in environment variables")
    jwtSecret = generateJWTSecret()
    console.log(`🔑 Generated JWT_SECRET: ${jwtSecret}`)
    console.log("💡 Add this to your .env.local file:\n")
    console.log(`JWT_SECRET=${jwtSecret}\n`)
  } else {
    console.log("✅ Using JWT_SECRET from environment variables\n")
  }

  // Sample users
  const sampleUsers = [
    {
      userId: "user_123",
      name: "John Doe",
      email: "john@example.com",
    },
    {
      userId: "user_456",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    {
      userId: "user_789",
      name: "Movie Lover",
      email: "movie@example.com",
    },
  ]

  console.log("📋 Generated JWT Tokens:\n")

  sampleUsers.forEach((user, index) => {
    const token = createJWT(user, jwtSecret)
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    console.log(`${index + 1}. User: ${user.name} (${user.email})`)
    console.log(`   Token: ${token}`)
    console.log(`   Length: ${token.length} characters`)
    console.log(`   Expires: ${expiryDate.toLocaleString()}`)
    console.log("")
  })

  console.log("🌐 Test with curl commands:")
  console.log('curl -H "Cookie: auth-token=YOUR_TOKEN_HERE" \\')
  console.log("     http://localhost:3000/api/auth/me")
  console.log("")
  console.log("🔧 Or use in browser console:")
  console.log('document.cookie = "auth-token=YOUR_TOKEN_HERE; path=/"')
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { createJWT, generateJWTSecret }

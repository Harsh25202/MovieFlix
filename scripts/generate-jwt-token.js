// Script to generate JWT tokens for testing purposes
const crypto = require("crypto")

// Base64 URL encode
function base64UrlEncode(data) {
  return Buffer.from(data).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Create HMAC signature
function createSignature(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest()
}

// Generate JWT token
function generateJWT(payload, secret) {
  // Create header
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  // Add timestamps to payload
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))

  // Create signature
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = createSignature(data, secret)
  const encodedSignature = base64UrlEncode(signature)

  return `${data}.${encodedSignature}`
}

// Verify JWT token
function verifyJWT(token, secret) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" }
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts

    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`
    const expectedSignature = createSignature(data, secret)
    const expectedEncodedSignature = base64UrlEncode(expectedSignature)

    if (encodedSignature !== expectedEncodedSignature) {
      return { valid: false, error: "Invalid signature" }
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString())

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return { valid: false, error: "Token expired" }
    }

    return { valid: true, payload }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// Main function
function main() {
  console.log("🔐 JWT Token Generator\n")

  // Get JWT secret from environment or use default
  const jwtSecret = process.env.JWT_SECRET || "default-secret-key-change-in-production"

  if (!process.env.JWT_SECRET) {
    console.log("⚠️  Warning: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.\n")
  }

  // Sample user data
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
      userId: "admin_789",
      name: "Admin User",
      email: "admin@example.com",
    },
  ]

  console.log("📋 Generated JWT Tokens:\n")

  sampleUsers.forEach((user, index) => {
    const token = generateJWT(user, jwtSecret)

    console.log(`${index + 1}. User: ${user.name} (${user.email})`)
    console.log(`   Token: ${token}`)
    console.log(`   Length: ${token.length} characters`)

    // Verify the token
    const verification = verifyJWT(token, jwtSecret)
    console.log(`   Valid: ${verification.valid ? "✅" : "❌"}`)

    if (verification.valid) {
      console.log(`   Expires: ${new Date(verification.payload.exp * 1000).toLocaleString()}`)
    } else {
      console.log(`   Error: ${verification.error}`)
    }
    console.log("")
  })

  // Custom token generation
  console.log("🛠️  Custom Token Generation:")
  console.log("You can also generate tokens for specific users by modifying this script.")
  console.log("Example usage in your API routes:")
  console.log(`
const { signJWT } = require('./lib/jwt')

// In your login/signup route:
const token = await signJWT({
  userId: user._id,
  name: user.name,
  email: user.email
})
`)

  // Show how to use in curl commands
  console.log("\n🌐 Test with curl commands:")
  const testToken = generateJWT(sampleUsers[0], jwtSecret)
  console.log(`
# Test authenticated endpoint:
curl -H "Cookie: auth-token=${testToken}" \\
     http://localhost:3000/api/auth/me

# Or set as Authorization header:
curl -H "Authorization: Bearer ${testToken}" \\
     http://localhost:3000/api/watchlist
`)

  console.log("\n✨ Token generation complete!")
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { generateJWT, verifyJWT }

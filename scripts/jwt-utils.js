// Utility functions for JWT operations
const crypto = require("crypto")

class JWTUtils {
  constructor(secret) {
    this.secret = secret || process.env.JWT_SECRET || "default-secret-key"
  }

  // Base64 URL encode
  base64UrlEncode(data) {
    return Buffer.from(data).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  // Base64 URL decode
  base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/")
    while (str.length % 4) {
      str += "="
    }
    return Buffer.from(str, "base64")
  }

  // Create HMAC signature
  createSignature(data) {
    return crypto.createHmac("sha256", this.secret).update(data).digest()
  }

  // Generate JWT token
  sign(payload, expiresIn = "7d") {
    const header = {
      alg: "HS256",
      typ: "JWT",
    }

    const now = Math.floor(Date.now() / 1000)
    let exp

    // Parse expiration time
    if (typeof expiresIn === "string") {
      const match = expiresIn.match(/^(\d+)([smhd])$/)
      if (match) {
        const value = Number.parseInt(match[1])
        const unit = match[2]
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 }
        exp = now + value * multipliers[unit]
      } else {
        exp = now + 7 * 24 * 60 * 60 // Default 7 days
      }
    } else {
      exp = now + expiresIn
    }

    const fullPayload = {
      ...payload,
      iat: now,
      exp: exp,
    }

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload))

    // Create signature
    const data = `${encodedHeader}.${encodedPayload}`
    const signature = this.createSignature(data)
    const encodedSignature = this.base64UrlEncode(signature)

    return `${data}.${encodedSignature}`
  }

  // Verify JWT token
  verify(token) {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid token format")
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts

      // Verify signature
      const data = `${encodedHeader}.${encodedPayload}`
      const expectedSignature = this.createSignature(data)
      const expectedEncodedSignature = this.base64UrlEncode(expectedSignature)

      if (encodedSignature !== expectedEncodedSignature) {
        throw new Error("Invalid signature")
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload).toString())

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        throw new Error("Token expired")
      }

      return payload
    } catch (error) {
      throw error
    }
  }

  // Decode token without verification (for debugging)
  decode(token) {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid token format")
      }

      const [encodedHeader, encodedPayload] = parts

      const header = JSON.parse(this.base64UrlDecode(encodedHeader).toString())
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload).toString())

      return { header, payload }
    } catch (error) {
      throw error
    }
  }

  // Check if token is expired
  isExpired(token) {
    try {
      const decoded = this.decode(token)
      const now = Math.floor(Date.now() / 1000)
      return decoded.payload.exp < now
    } catch (error) {
      return true
    }
  }

  // Get time until expiration
  getTimeUntilExpiration(token) {
    try {
      const decoded = this.decode(token)
      const now = Math.floor(Date.now() / 1000)
      return Math.max(0, decoded.payload.exp - now)
    } catch (error) {
      return 0
    }
  }
}

// Export for use in other scripts
module.exports = JWTUtils

// CLI usage
if (require.main === module) {
  const jwt = new JWTUtils()

  console.log("🔧 JWT Utilities Demo\n")

  // Generate sample tokens
  const users = [
    { userId: "user_1", name: "Alice", email: "alice@example.com" },
    { userId: "user_2", name: "Bob", email: "bob@example.com" },
  ]

  users.forEach((user) => {
    console.log(`👤 User: ${user.name}`)

    // Generate tokens with different expiration times
    const shortToken = jwt.sign(user, "1h")
    const longToken = jwt.sign(user, "30d")

    console.log(`   Short token (1h): ${shortToken.substring(0, 50)}...`)
    console.log(`   Long token (30d): ${longToken.substring(0, 50)}...`)

    // Verify tokens
    try {
      const verified = jwt.verify(shortToken)
      console.log(`   ✅ Token valid until: ${new Date(verified.exp * 1000).toLocaleString()}`)
    } catch (error) {
      console.log(`   ❌ Token error: ${error.message}`)
    }

    console.log("")
  })
}

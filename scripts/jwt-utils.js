// JWT Utilities for MovieFlix
// Advanced JWT operations and utilities

const crypto = require("crypto")

class JWTUtils {
  constructor(secret) {
    this.secret = secret || process.env.JWT_SECRET
    if (!this.secret) {
      throw new Error("JWT secret is required")
    }
  }

  base64urlEncode(str) {
    return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  base64urlDecode(str) {
    str += "=".repeat((4 - (str.length % 4)) % 4)
    str = str.replace(/-/g, "+").replace(/_/g, "/")
    return Buffer.from(str, "base64").toString()
  }

  sign(payload, expiresIn = "7d") {
    const header = { alg: "HS256", typ: "JWT" }
    const now = Math.floor(Date.now() / 1000)

    // Parse expiration
    let exp = now
    if (expiresIn.endsWith("d")) {
      exp += Number.parseInt(expiresIn) * 24 * 60 * 60
    } else if (expiresIn.endsWith("h")) {
      exp += Number.parseInt(expiresIn) * 60 * 60
    } else if (expiresIn.endsWith("m")) {
      exp += Number.parseInt(expiresIn) * 60
    } else {
      exp += Number.parseInt(expiresIn)
    }

    const fullPayload = { ...payload, iat: now, exp }

    const encodedHeader = this.base64urlEncode(JSON.stringify(header))
    const encodedPayload = this.base64urlEncode(JSON.stringify(fullPayload))
    const data = `${encodedHeader}.${encodedPayload}`

    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(data)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    return `${data}.${signature}`
  }

  verify(token) {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) return null

      const [encodedHeader, encodedPayload, encodedSignature] = parts
      const data = `${encodedHeader}.${encodedPayload}`

      const expectedSignature = crypto
        .createHmac("sha256", this.secret)
        .update(data)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")

      if (expectedSignature !== encodedSignature) return null

      const payload = JSON.parse(this.base64urlDecode(encodedPayload))
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null

      return payload
    } catch (error) {
      return null
    }
  }

  decode(token) {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) return null

      const header = JSON.parse(this.base64urlDecode(parts[0]))
      const payload = JSON.parse(this.base64urlDecode(parts[1]))

      return { header, payload }
    } catch (error) {
      return null
    }
  }

  isExpired(token) {
    const decoded = this.decode(token)
    if (!decoded || !decoded.payload.exp) return false
    return decoded.payload.exp < Math.floor(Date.now() / 1000)
  }

  getTimeUntilExpiry(token) {
    const decoded = this.decode(token)
    if (!decoded || !decoded.payload.exp) return null

    const now = Math.floor(Date.now() / 1000)
    const timeLeft = decoded.payload.exp - now

    if (timeLeft <= 0) return "Expired"

    const days = Math.floor(timeLeft / (24 * 60 * 60))
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  refresh(token, expiresIn = "7d") {
    const payload = this.verify(token)
    if (!payload) return null

    // Remove old timestamps
    delete payload.iat
    delete payload.exp

    return this.sign(payload, expiresIn)
  }

  static generateSecret(length = 32) {
    return crypto.randomBytes(length).toString("hex")
  }
}

// Demo function
function demo() {
  console.log("🔧 JWT Utils Demo\n")

  try {
    const secret = process.env.JWT_SECRET || JWTUtils.generateSecret()
    const jwt = new JWTUtils(secret)

    console.log("🔑 Secret:", secret)
    console.log("")

    // Create token
    const payload = {
      userId: "demo_user",
      name: "Demo User",
      email: "demo@example.com",
    }

    const token = jwt.sign(payload, "1h")
    console.log("📝 Created token:", token)
    console.log("📏 Token length:", token.length)
    console.log("")

    // Verify token
    const verified = jwt.verify(token)
    console.log("✅ Verified payload:", verified)
    console.log("")

    // Decode token
    const decoded = jwt.decode(token)
    console.log("📋 Decoded token:")
    console.log("   Header:", decoded.header)
    console.log("   Payload:", decoded.payload)
    console.log("")

    // Check expiry
    console.log("⏰ Time until expiry:", jwt.getTimeUntilExpiry(token))
    console.log("🔍 Is expired:", jwt.isExpired(token))
    console.log("")

    // Refresh token
    const refreshed = jwt.refresh(token, "2h")
    console.log("🔄 Refreshed token:", refreshed)
    console.log("⏰ New expiry time:", jwt.getTimeUntilExpiry(refreshed))
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
}

// Run demo if called directly
if (require.main === module) {
  demo()
}

module.exports = JWTUtils

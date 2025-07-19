// Edge Runtime compatible JWT functions using Web Crypto API

interface JWTPayload {
  userId: string
  name: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Base64URL encode
 */
function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

/**
 * Base64URL decode
 */
function base64urlDecode(str: string): Uint8Array {
  // Add padding if needed
  str += "=".repeat((4 - (str.length % 4)) % 4)
  // Replace URL-safe characters
  str = str.replace(/-/g, "+").replace(/_/g, "/")

  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Sign a JWT token
 */
export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required")
  }

  // Create header
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  // Create payload with timestamps
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  // Encode header and payload
  const encodedHeader = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)))
  const encodedPayload = base64urlEncode(new TextEncoder().encode(JSON.stringify(fullPayload)))

  // Create signature
  const data = `${encodedHeader}.${encodedPayload}`
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  const encodedSignature = base64urlEncode(new Uint8Array(signature))

  return `${data}.${encodedSignature}`
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required")
    }

    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts

    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )

    const signature = base64urlDecode(encodedSignature)
    const isValid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(data))

    if (!isValid) {
      return null
    }

    // Decode payload
    const payloadBytes = base64urlDecode(encodedPayload)
    const payloadStr = new TextDecoder().decode(payloadBytes)
    const payload: JWTPayload = JSON.parse(payloadStr)

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

/**
 * Decode JWT without verification (for debugging)
 */
export function decodeJWT(token: string): { header: any; payload: JWTPayload } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [encodedHeader, encodedPayload] = parts

    const headerBytes = base64urlDecode(encodedHeader)
    const payloadBytes = base64urlDecode(encodedPayload)

    const header = JSON.parse(new TextDecoder().decode(headerBytes))
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes))

    return { header, payload }
  } catch (error) {
    console.error("JWT decode error:", error)
    return null
  }
}

// Edge Runtime compatible JWT functions using Web Crypto API

interface JWTPayload {
  userId: string
  name: string
  email: string
  iat?: number
  exp?: number
}

// Base64URL encode
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Base64URL decode
function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  return new Uint8Array(binary.split("").map((char) => char.charCodeAt(0)))
}

// Get JWT secret as CryptoKey
async function getJWTKey(): Promise<CryptoKey> {
  const secret = process.env.JWT_SECRET || "your-super-secret-key-at-least-32-characters-long"
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)

  return await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  const encoder = new TextEncoder()
  const headerEncoded = base64urlEncode(encoder.encode(JSON.stringify(header)))
  const payloadEncoded = base64urlEncode(encoder.encode(JSON.stringify(fullPayload)))

  const message = `${headerEncoded}.${payloadEncoded}`
  const messageData = encoder.encode(message)

  const key = await getJWTKey()
  const signature = await crypto.subtle.sign("HMAC", key, messageData)
  const signatureEncoded = base64urlEncode(new Uint8Array(signature))

  return `${message}.${signatureEncoded}`
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts

    // Verify signature
    const encoder = new TextEncoder()
    const message = `${headerEncoded}.${payloadEncoded}`
    const messageData = encoder.encode(message)

    const key = await getJWTKey()
    const signature = base64urlDecode(signatureEncoded)

    const isValid = await crypto.subtle.verify("HMAC", key, signature, messageData)
    if (!isValid) {
      return null
    }

    // Decode payload
    const payloadData = base64urlDecode(payloadEncoded)
    const payloadStr = new TextDecoder().decode(payloadData)
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

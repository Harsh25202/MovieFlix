// Edge Runtime compatible JWT functions using Web Crypto API

interface JWTPayload {
  userId: string
  name: string
  email: string
  iat: number
  exp: number
}

// Base64 URL encode
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Base64 URL decode
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) {
    str += "="
  }
  return new Uint8Array(
    atob(str)
      .split("")
      .map((char) => char.charCodeAt(0)),
  )
}

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required")
  }

  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  // Create header
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  // Encode header and payload
  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)))
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(fullPayload)))

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
  const encodedSignature = base64UrlEncode(new Uint8Array(signature))

  return `${data}.${encodedSignature}`
}

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

    const signature = base64UrlDecode(encodedSignature)
    const isValid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(data))

    if (!isValid) {
      return null
    }

    // Decode payload
    const payloadData = base64UrlDecode(encodedPayload)
    const payload: JWTPayload = JSON.parse(new TextDecoder().decode(payloadData))

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

// Edge Runtime compatible crypto functions using Web Crypto API

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Import the password as a key
  const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

  // Derive the hash
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  )

  // Combine salt and hash
  const hashArray = new Uint8Array(hashBuffer)
  const combined = new Uint8Array(salt.length + hashArray.length)
  combined.set(salt)
  combined.set(hashArray, salt.length)

  // Convert to base64
  return btoa(String.fromCharCode(...combined))
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    // Decode the stored hash
    const combined = new Uint8Array(
      atob(hashedPassword)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )

    // Extract salt and hash
    const salt = combined.slice(0, 16)
    const storedHash = combined.slice(16)

    // Import the password as a key
    const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

    // Derive the hash with the same salt
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    )

    const hashArray = new Uint8Array(hashBuffer)

    // Compare hashes
    if (hashArray.length !== storedHash.length) {
      return false
    }

    for (let i = 0; i < hashArray.length; i++) {
      if (hashArray[i] !== storedHash[i]) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

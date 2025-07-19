import { cookies } from "next/headers"
import { verifyJWT } from "./jwt"

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return false
    }

    const decoded = await verifyJWT(token)
    return !!decoded
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function getServerUser(): Promise<{ id: string; name: string; email: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return null
    }

    return {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    }
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}

export async function requireAuth(): Promise<{ id: string; name: string; email: string }> {
  const user = await getServerUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

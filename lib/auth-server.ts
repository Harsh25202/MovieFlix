import { cookies } from "next/headers"
import { verifyJWT } from "./jwt"

export interface AuthUser {
  userId: string
  name: string
  email: string
}

/**
 * Get the current authenticated user from cookies
 */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return null
    }

    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser()
  return user !== null
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

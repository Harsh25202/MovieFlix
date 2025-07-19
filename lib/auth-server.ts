import { cookies } from "next/headers"
import { verifyJWT } from "./jwt"
import { DatabaseService } from "./database"

export interface AuthUser {
  id: string
  name: string
  email: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
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

    // Verify user still exists in database
    const user = await DatabaseService.getUserByEmail(payload.email)
    if (!user) {
      return null
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    console.error("Error getting auth user:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

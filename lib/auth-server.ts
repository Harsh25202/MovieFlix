import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function getServerUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    return {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    }
  } catch (error) {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerUser()
  return !!user
}

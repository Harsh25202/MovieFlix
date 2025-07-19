import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

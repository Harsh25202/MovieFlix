export const runtime = "edge";
import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getServerUser } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "stats":
        const stats = await DatabaseService.getCollectionStats()
        return NextResponse.json({ stats })

      case "indexes":
        await DatabaseService.createIndexes()
        return NextResponse.json({
          success: true,
          message: "Indexes created/updated successfully",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Database admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

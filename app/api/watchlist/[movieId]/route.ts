import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getServerUser } from "@/lib/auth-server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ movieId: string }> }) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { movieId } = await params
    const updates = await request.json()

    const success = await DatabaseService.updateWatchlistItem(user.id, movieId, updates)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Watchlist item updated successfully",
      })
    } else {
      return NextResponse.json({ error: "Failed to update watchlist item" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating watchlist item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

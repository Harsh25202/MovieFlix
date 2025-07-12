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
    const status = searchParams.get("status") as "want_to_watch" | "watching" | "watched" | null

    const watchlist = await DatabaseService.getUserWatchlist(user.id, status || undefined)

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { movieId, status = "want_to_watch" } = await request.json()

    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 })
    }

    const watchlistItem = await DatabaseService.addToWatchlist(user.id, movieId, status)

    return NextResponse.json({
      success: true,
      watchlistItem,
      message: "Added to watchlist successfully",
    })
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get("movieId")

    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 })
    }

    const success = await DatabaseService.removeFromWatchlist(user.id, movieId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Removed from watchlist successfully",
      })
    } else {
      return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

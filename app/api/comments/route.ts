import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, movie_id, text } = body

    if (!name || !email || !movie_id || !text) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const comment = await DatabaseService.addComment({
      name,
      email,
      movie_id,
      text,
      date: new Date(),
    })

    // Update movie comment count
    await DatabaseService.updateMovieCommentCount(movie_id)

    return NextResponse.json({
      success: true,
      comment,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

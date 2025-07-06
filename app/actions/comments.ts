"use server"

import { DatabaseService } from "@/lib/database"
import { revalidatePath } from "next/cache"

export async function addCommentAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const movieId = formData.get("movieId") as string
  const text = formData.get("text") as string

  if (!name || !email || !movieId || !text) {
    return {
      success: false,
      error: "All fields are required",
    }
  }

  try {
    const comment = await DatabaseService.addComment({
      name,
      email,
      movie_id: movieId,
      text,
      date: new Date(),
    })

    // Revalidate the movie page to show the new comment
    revalidatePath(`/movies/${movieId}`)

    return {
      success: true,
      comment,
    }
  } catch (error) {
    console.error("Failed to add comment:", error)
    return {
      success: false,
      error: "Failed to add comment. Please try again.",
    }
  }
}

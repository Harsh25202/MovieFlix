"use server"

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
    // Use API route instead of direct database import
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        movie_id: movieId,
        text,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to add comment")
    }

    const result = await response.json()

    // Revalidate the movie page to show the new comment
    revalidatePath(`/movies/${movieId}`)

    return {
      success: true,
      comment: result.comment,
    }
  } catch (error) {
    console.error("Failed to add comment:", error)
    return {
      success: false,
      error: "Failed to add comment. Please try again.",
    }
  }
}

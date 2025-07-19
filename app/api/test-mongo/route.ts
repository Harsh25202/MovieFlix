import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export const runtime = "edge"

export async function GET() {
  try {
    console.log("🔍 Testing MongoDB connection...")

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: "MONGODB_URI environment variable not found",
        fallback: "Using dummy data",
      })
    }

    const db = await getDatabase()
    if (!db) {
      return NextResponse.json({
        success: false,
        error: "Failed to connect to MongoDB",
        fallback: "Using dummy data",
      })
    }

    // Test a simple query
    const moviesCount = await db.collection("movies").countDocuments()
    const usersCount = await db.collection("users").countDocuments()

    console.log("✅ MongoDB connection successful")

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      collections: {
        movies: moviesCount,
        users: usersCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)

    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: "Using dummy data",
      timestamp: new Date().toISOString(),
    })
  }
}

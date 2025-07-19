import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  let databaseStatus = "disconnected"
  let error = null
  let collections = []
  const mongoUri = process.env.MONGODB_URI ? "configured" : "not configured"

  try {
    // Check database connection
    const stats = await DatabaseService.getCollectionStats()
    if (stats) {
      databaseStatus = "connected"
      collections = Object.keys(stats)
      console.log(`✅ Health check: Database connected with ${collections.length} collections`)
    } else {
      databaseStatus = "not configured"
      console.log("⚠️ Health check: Database not configured")
    }
  } catch (err) {
    databaseStatus = "error"
    error = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Health check: Database error:", error)
  }

  const isHealthy = databaseStatus === "connected" || databaseStatus === "not configured"

  const response = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: {
      status: databaseStatus,
      collections: collections.length,
      collectionNames: collections,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      mongoUri: mongoUri,
      dbName: process.env.MONGODB_DB_NAME || "movieflix",
    },
    runtime: "edge",
    ...(error && { error }),
  }

  console.log("🏥 Health check response:", JSON.stringify(response, null, 2))

  return NextResponse.json(response, { status: isHealthy ? 200 : 500 })
}

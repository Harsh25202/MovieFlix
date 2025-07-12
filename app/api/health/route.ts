export const runtime = "edge";
import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  let databaseStatus = "disconnected"
  let error = null
  let collections = []
  const mongoUri = process.env.MONGODB_URI ? "configured" : "not configured"

  try {
    // Check database connection
    const db = await getDatabase()
    if (db) {
      await db.admin().ping()
      databaseStatus = "connected"

      // Get collections info
      collections = await db.listCollections().toArray()
      console.log(`✅ Health check: MongoDB connected with ${collections.length} collections`)
    } else {
      databaseStatus = "not configured"
      console.log("⚠️ Health check: MongoDB not configured")
    }
  } catch (err) {
    databaseStatus = "error"
    error = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Health check: MongoDB error:", error)
  }

  const isHealthy = databaseStatus === "connected" || databaseStatus === "not configured"

  const response = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: {
      status: databaseStatus,
      collections: collections.length,
      collectionNames: collections.map((c) => c.name),
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      mongoUri: mongoUri,
      dbName: process.env.MONGODB_DB_NAME || "movieflix",
    },
    ...(error && { error }),
  }

  console.log("🏥 Health check response:", JSON.stringify(response, null, 2))

  return NextResponse.json(response, { status: isHealthy ? 200 : 500 })
}

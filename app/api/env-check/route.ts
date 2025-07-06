import { NextResponse } from "next/server"

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      MONGODB_URI: {
        exists: !!process.env.MONGODB_URI,
        length: process.env.MONGODB_URI?.length || 0,
        startsWithMongodb: process.env.MONGODB_URI?.startsWith("mongodb") || false,
        preview: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + "..." : "NOT SET",
      },
      MONGODB_DB_NAME: {
        exists: !!process.env.MONGODB_DB_NAME,
        value: process.env.MONGODB_DB_NAME || "NOT SET",
      },
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
      },
      NODE_ENV: {
        exists: !!process.env.NODE_ENV,
        value: process.env.NODE_ENV || "NOT SET",
      },
    },
    allEnvKeys: Object.keys(process.env).filter(
      (key) => key.includes("MONGO") || key.includes("JWT") || key.includes("NODE_ENV"),
    ),
    recommendations: [],
  }

  // Add recommendations based on findings
  if (!envCheck.variables.MONGODB_URI.exists) {
    envCheck.recommendations.push("❌ MONGODB_URI is not set - this is why the app uses dummy data")
  }

  if (!envCheck.variables.MONGODB_URI.startsWithMongodb) {
    envCheck.recommendations.push("⚠️ MONGODB_URI doesn't start with 'mongodb' - check the format")
  }

  if (!envCheck.variables.JWT_SECRET.exists) {
    envCheck.recommendations.push("⚠️ JWT_SECRET is not set - authentication may not work")
  }

  if (envCheck.variables.JWT_SECRET.length < 32) {
    envCheck.recommendations.push("⚠️ JWT_SECRET is too short - should be at least 32 characters")
  }

  console.log("🔍 Environment Variables Check:")
  console.log(JSON.stringify(envCheck, null, 2))

  return NextResponse.json(envCheck)
}

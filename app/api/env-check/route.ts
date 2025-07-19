import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET() {
  const envVars = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    MONGODB_DB_NAME: !!process.env.MONGODB_DB_NAME,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  }

  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => key !== "NODE_ENV" && !value)
    .map(([key]) => key)

  return NextResponse.json({
    environmentVariables: envVars,
    missingVariables: missingVars,
    allConfigured: missingVars.length === 0,
    runtime: "edge",
    timestamp: new Date().toISOString(),
  })
}

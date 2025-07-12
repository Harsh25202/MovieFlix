export const runtime = "edge";
import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

// Function to safely log URI (hide password)
function createSafeLogURI(uri: string) {
  if (!uri) return "Not provided"
  try {
    const url = new URL(uri)
    if (url.username) {
      return uri.replace(/\/\/.*:.*@/, "//***:***@")
    }
    return uri
  } catch (error) {
    return uri.replace(/\/\/.*:.*@/, "//***:***@")
  }
}

// Function to properly encode MongoDB URI
function encodeMongoURI(uri: string): string {
  if (!uri) return uri

  try {
    // Check if URI is already encoded
    if (uri.includes("%40") || uri.includes("%23") || uri.includes("%25")) {
      return uri
    }

    const url = new URL(uri)
    if (url.username && url.password) {
      const encodedUsername = encodeURIComponent(url.username)
      const encodedPassword = url.password
      url.username = encodedUsername
      url.password = encodedPassword
      return url.toString()
    }
    return uri
  } catch (error) {
    return uri
  }
}

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    },
    connection: {
      status: "unknown",
      error: null,
      details: {},
    },
  }

  console.log("🔍 MongoDB Connection Test Started")
  console.log("Environment Variables:")
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`- MONGODB_URI exists: ${!!process.env.MONGODB_URI}`)
  console.log(`- MONGODB_DB_NAME: ${process.env.MONGODB_DB_NAME}`)
  console.log(`- JWT_SECRET exists: ${!!process.env.JWT_SECRET}`)

  if (!process.env.MONGODB_URI) {
    console.log("❌ MONGODB_URI not found in environment variables")
    testResults.connection.status = "no_uri"
    testResults.connection.error = "MONGODB_URI environment variable not set"
    return NextResponse.json(testResults, { status: 500 })
  }

  const rawUri = process.env.MONGODB_URI
  const encodedUri = encodeMongoURI(rawUri)
  const safeUri = createSafeLogURI(encodedUri)
  const dbName = process.env.MONGODB_DB_NAME || "movieflix"

  console.log(`📡 Raw URI: ${createSafeLogURI(rawUri)}`)
  console.log(`🔐 Encoded URI: ${safeUri}`)
  console.log(`🗄️ Database Name: ${dbName}`)

  testResults.connection.details = {
    safeUri,
    dbName,
    uriEncoded: rawUri !== encodedUri,
  }

  const client = new MongoClient(encodedUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  })

  try {
    console.log("🔌 Attempting to connect...")
    await client.connect()
    console.log("✅ Connected to MongoDB")

    console.log("🏓 Testing ping...")
    const db = client.db(dbName)
    await db.admin().ping()
    console.log("✅ Ping successful")

    console.log("📊 Listing collections...")
    const collections = await db.listCollections().toArray()
    console.log(
      `✅ Found ${collections.length} collections:`,
      collections.map((c) => c.name),
    )

    // Test a simple query
    console.log("🎬 Testing movies collection...")
    const movieCount = await db.collection("movies").countDocuments()
    console.log(`✅ Movies collection has ${movieCount} documents`)

    testResults.connection.status = "success"
    testResults.connection.details = {
      ...testResults.connection.details,
      collections: collections.map((c) => c.name),
      movieCount,
      pingSuccessful: true,
    }

    console.log("🎉 MongoDB connection test PASSED")
  } catch (error) {
    console.error("❌ MongoDB connection test FAILED:", error.message)
    testResults.connection.status = "failed"
    testResults.connection.error = error.message

    // Detailed error analysis
    if (error.message.includes("Authentication failed")) {
      console.error("🔐 Authentication issue - check username/password")
      testResults.connection.details.issue = "authentication"
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("🌐 DNS resolution failed - check cluster URL")
      testResults.connection.details.issue = "dns"
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("🔗 Connection refused - check if cluster is running")
      testResults.connection.details.issue = "connection_refused"
    } else if (error.message.includes("MongoServerSelectionError")) {
      console.error("⏰ Server selection timeout - check network/firewall")
      testResults.connection.details.issue = "server_selection"
    }
  } finally {
    await client.close()
  }

  const isSuccess = testResults.connection.status === "success"
  return NextResponse.json(testResults, { status: isSuccess ? 200 : 500 })
}

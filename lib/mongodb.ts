import { MongoClient, type Db } from "mongodb"

// Ensure this only runs in Node.js runtime
if (typeof window !== "undefined") {
  throw new Error("MongoDB connection should only be used on the server side")
}

// Function to properly encode MongoDB URI
function encodeMongoURI(uri: string): string {
  if (!uri) return uri

  try {
    if (uri.includes("%40") || uri.includes("%23") || uri.includes("%25")) {
      console.log("🔐 URI appears to be already encoded, using as-is")
      return uri
    }

    const url = new URL(uri)

    if (url.username && url.password) {
      const encodedUsername = encodeURIComponent(url.username)
      const encodedPassword = url.password

      url.username = encodedUsername
      url.password = encodedPassword

      console.log("🔐 Encoded credentials in MongoDB URI")
      return url.toString()
    }

    return uri
  } catch (error) {
    console.warn("Could not parse MongoDB URI, using as-is:", error)
    return uri
  }
}

const rawUri = process.env.MONGODB_URI
const uri = rawUri ? encodeMongoURI(rawUri) : undefined
const dbName = process.env.MONGODB_DB_NAME || "sample_mflix"

console.log("🔍 MongoDB Configuration Debug:")
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`- MONGODB_URI exists: ${!!rawUri}`)
console.log(`- MONGODB_DB_NAME: ${dbName}`)

if (!uri) {
  console.error("❌ CRITICAL: MONGODB_URI not found in environment variables!")
  console.error("❌ App will use dummy data as fallback")
} else {
  const safeUri = uri.replace(/\/\/.*:.*@/, "//***:***@")
  console.log(`📡 MongoDB URI configured: ${safeUri}`)
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (uri) {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    family: 4,
    retryWrites: true,
    w: "majority" as const,
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      console.log("🔄 Creating new MongoDB client (development)")
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    console.log("🚀 Creating new MongoDB client (production)")
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
} else {
  console.error("❌ MongoDB client not initialized - URI missing")
}

export async function getDatabase(): Promise<Db | null> {
  if (!clientPromise) {
    console.error("❌ CRITICAL: MongoDB client promise not available")
    return null
  }

  try {
    console.log("🔌 Attempting to connect to MongoDB...")
    const startTime = Date.now()

    const client = await clientPromise
    const connectTime = Date.now() - startTime
    console.log(`⚡ MongoDB client connected in ${connectTime}ms`)

    const db = client.db(dbName)
    console.log(`🗄️ Using database: ${dbName}`)

    console.log("🏓 Testing MongoDB connection with ping...")
    const pingStart = Date.now()
    await db.admin().ping()
    const pingTime = Date.now() - pingStart
    console.log(`✅ MongoDB ping successful in ${pingTime}ms`)

    console.log("📊 Testing collections access...")
    const collections = await db.listCollections().toArray()
    console.log(`✅ Found ${collections.length} collections: ${collections.map((c) => c.name).join(", ")}`)

    console.log("🎉 MongoDB connection fully established and tested!")
    return db
  } catch (error) {
    console.error("❌ CRITICAL: Failed to connect to MongoDB")
    console.error(`❌ Error type: ${(error as Error).constructor.name}`)
    console.error(`❌ Error message: ${(error as Error).message}`)

    if ((error as Error).message.includes("ECONNREFUSED")) {
      console.error("🔧 DIAGNOSIS: Connection refused - MongoDB server not reachable")
    } else if ((error as Error).message.includes("Authentication failed")) {
      console.error("🔐 DIAGNOSIS: Authentication failed - invalid credentials")
    } else if ((error as Error).message.includes("getaddrinfo ENOTFOUND")) {
      console.error("🌐 DIAGNOSIS: DNS resolution failed - invalid hostname")
    }

    console.error("🔄 FALLBACK: App will use dummy data")
    return null
  }
}

export { clientPromise }

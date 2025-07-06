import { MongoClient, type Db } from "mongodb"

// Function to properly encode MongoDB URI (avoid double encoding)
function encodeMongoURI(uri: string): string {
  if (!uri) return uri

  try {
    // Check if URI is already encoded by looking for encoded characters
    if (uri.includes("%40") || uri.includes("%23") || uri.includes("%25")) {
      console.log("🔐 URI appears to be already encoded, using as-is")
      return uri
    }

    // Parse the URI to extract components
    const url = new URL(uri)

    // If username and password exist, encode them
    if (url.username && url.password) {
      const encodedUsername = encodeURIComponent(url.username)
      const encodedPassword = url.password

      // Reconstruct the URI with encoded credentials
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

// Use the MongoDB URI with proper encoding
const rawUri = process.env.MONGODB_URI
const uri = rawUri ? encodeMongoURI(rawUri) : undefined
const dbName = process.env.MONGODB_DB_NAME || "movieflix"

// Detailed logging for debugging
console.log("🔍 MongoDB Configuration Debug:")
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`- MONGODB_URI exists: ${!!rawUri}`)
console.log(`- MONGODB_DB_NAME: ${dbName}`)
console.log(`- JWT_SECRET exists: ${!!process.env.JWT_SECRET}`)

if (!uri) {
  console.error("❌ CRITICAL: MONGODB_URI not found in environment variables!")
  console.error("❌ This means the environment variable is not set properly")
  console.error("❌ App will use dummy data as fallback")

  // Log all environment variables that start with MONGO (for debugging)
  const mongoEnvs = Object.keys(process.env).filter((key) => key.includes("MONGO"))
  console.log("🔍 Environment variables containing 'MONGO':", mongoEnvs)
} else {
  // Hide credentials in log
  const safeUri = uri.replace(/\/\/.*:.*@/, "//***:***@")
  console.log(`📡 MongoDB URI configured: ${safeUri}`)
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// Only initialize MongoDB if URI is provided
if (uri) {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000, // Increased timeout
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    w: "majority" as const,
  }

  console.log("🔧 MongoDB client options:", JSON.stringify(options, null, 2))

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      console.log("🔄 Creating new MongoDB client (development)")
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
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
    console.error("❌ This usually means MONGODB_URI environment variable is not set")
    console.error("❌ Returning null - app will use dummy data")
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

    // Test the connection with a simple ping
    console.log("🏓 Testing MongoDB connection with ping...")
    const pingStart = Date.now()
    await db.admin().ping()
    const pingTime = Date.now() - pingStart
    console.log(`✅ MongoDB ping successful in ${pingTime}ms`)

    // Test collections access
    console.log("📊 Testing collections access...")
    const collections = await db.listCollections().toArray()
    console.log(`✅ Found ${collections.length} collections: ${collections.map((c) => c.name).join(", ")}`)

    console.log("🎉 MongoDB connection fully established and tested!")
    return db
  } catch (error) {
    console.error("❌ CRITICAL: Failed to connect to MongoDB")
    console.error(`❌ Error type: ${error.constructor.name}`)
    console.error(`❌ Error message: ${error.message}`)

    // Detailed error analysis
    if (error.message.includes("ECONNREFUSED")) {
      console.error("🔧 DIAGNOSIS: Connection refused - MongoDB server not reachable")
      console.error("🔧 SOLUTION: Check if MongoDB Atlas cluster is running and accessible")
    } else if (error.message.includes("Authentication failed")) {
      console.error("🔐 DIAGNOSIS: Authentication failed - invalid credentials")
      console.error("🔐 SOLUTION: Check username/password in MONGODB_URI")
    } else if (error.message.includes("getaddrinfo ENOTFOUND")) {
      console.error("🌐 DIAGNOSIS: DNS resolution failed - invalid hostname")
      console.error("🌐 SOLUTION: Check cluster URL in MONGODB_URI")
    } else if (error.message.includes("MongoServerSelectionError")) {
      console.error("⏰ DIAGNOSIS: Server selection timeout - network/firewall issue")
      console.error("⏰ SOLUTION: Check network connectivity and IP whitelist")
    } else if (error.message.includes("MongoNetworkError")) {
      console.error("🌐 DIAGNOSIS: Network error - connection issue")
      console.error("🌐 SOLUTION: Check internet connection and firewall settings")
    }

    console.error("🔄 FALLBACK: App will use dummy data")
    return null
  }
}

export { clientPromise }

const { MongoClient } = require("mongodb")

// Load environment variables in correct order
function loadEnvironment() {
  const envFiles = [".env", ".env.production", ".env.local"]

  for (const envFile of envFiles) {
    const envPath = require("path").join(process.cwd(), envFile)
    try {
      require("dotenv").config({ path: envPath, override: false })
      console.log(`📁 Loaded: ${envFile}`)
    } catch (error) {
      // Continue to next file
    }
  }
}

// Function to avoid double encoding
function encodeMongoURI(uri) {
  if (!uri) return uri

  try {
    // Check if already encoded
    if (uri.includes("%40") || uri.includes("%23") || uri.includes("%25")) {
      console.log(`🔐 URI appears to be already encoded`)
      return uri
    }

    const url = new URL(uri)

    if (url.username && url.password) {
      const encodedUsername = encodeURIComponent(url.username)
      const encodedPassword = url.password

      url.username = encodedUsername
      url.password = encodedPassword

      console.log(`🔐 Encoded credentials in MongoDB URI`)
      return url.toString()
    }

    return uri
  } catch (error) {
    console.log(`⚠️  Could not parse URI: ${error.message}`)
    return uri
  }
}

loadEnvironment()

async function checkConnection() {
  console.log("🔍 Checking MongoDB Connection\n")

  const rawUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME || "movieflix"

  console.log("📋 Configuration:")
  console.log(`MongoDB URI: ${rawUri ? "✅ Set" : "❌ Not set"}`)
  console.log(`Database Name: ${dbName}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)

  if (!rawUri) {
    console.log("\n❌ MongoDB URI not found!")
    console.log("Add this to your environment files:")
    console.log("\n.env (base):")
    console.log("MONGODB_URI=mongodb://localhost:27017/movieflix")
    console.log("\n.env.production (production):")
    console.log("MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database")
    console.log("\n.env.local (local overrides):")
    console.log("MONGODB_URI=your-local-override-uri")
    return
  }

  const uri = encodeMongoURI(rawUri)
  const safeUri = uri.replace(/\/\/.*:.*@/, "//***:***@")
  console.log(`Connection String: ${safeUri}`)

  console.log("\n🔌 Testing connection...")

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })

  try {
    await client.connect()
    console.log("✅ Connected successfully!")

    const db = client.db(dbName)
    await db.admin().ping()
    console.log("✅ Database ping successful!")

    // Check collections
    const collections = await db.listCollections().toArray()
    console.log(`📊 Found ${collections.length} collections`)

    if (collections.length === 0) {
      console.log("💡 Database is empty - run 'npm run seed' to add sample data")
    } else {
      console.log("Collections:")
      collections.forEach((col) => console.log(`   - ${col.name}`))
    }
  } catch (error) {
    console.log("❌ Connection failed:")
    console.log(error.message)

    if (error.message.includes("Authentication failed")) {
      console.log("\n🔧 Authentication issue:")
      console.log("1. Check your username and password")
      console.log("2. Ensure special characters in password are URL-encoded")
      console.log("3. Example: @ becomes %40, # becomes %23")
      console.log("4. Check if password is already encoded (avoid double encoding)")
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("\n🔧 DNS/Network issue:")
      console.log("1. Check your internet connection")
      console.log("2. Verify the cluster URL is correct")
    }
  } finally {
    await client.close()
  }
}

checkConnection()

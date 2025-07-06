const { MongoClient } = require("mongodb")

// Load environment variables
require("dotenv").config({ path: ".env.local" })

// Function to encode MongoDB URI
function encodeMongoURI(uri) {
  if (!uri) return uri

  try {
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
    console.log(`⚠️  Could not parse URI: ${error.message}`)
    return uri
  }
}

// Function to create safe URI for logging
function createSafeLogURI(uri) {
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

async function validateMongoURI() {
  console.log("🔍 MongoDB URI Validator\n")

  const rawUri = process.env.MONGODB_URI

  if (!rawUri) {
    console.log("❌ MONGODB_URI not found in environment variables")
    console.log("\n📝 Add this to your .env.local file:")
    console.log("MONGODB_URI=mongodb://localhost:27017/movieflix")
    console.log("\n💡 Examples of valid URIs:")
    console.log("Local: mongodb://localhost:27017/movieflix")
    console.log("Local with auth: mongodb://username:password@localhost:27017/movieflix")
    console.log("Atlas: mongodb+srv://username:password@cluster.mongodb.net/database")
    return
  }

  console.log("📋 Original URI (from .env.local):")
  console.log(createSafeLogURI(rawUri))

  // Check if password contains special characters
  try {
    const url = new URL(rawUri)
    if (url.password) {
      const hasSpecialChars = /[@#%&+=]/.test(url.password)
      if (hasSpecialChars) {
        console.log("\n⚠️  Password contains special characters that need encoding")
        console.log("Characters that need encoding: @ # % & + =")
      }
    }
  } catch (error) {
    console.log("\n⚠️  Could not parse URI format")
  }

  // Encode the URI
  const encodedUri = encodeMongoURI(rawUri)

  if (encodedUri !== rawUri) {
    console.log("\n🔐 Encoded URI:")
    console.log(createSafeLogURI(encodedUri))
  }

  // Test connection
  console.log("\n🔌 Testing MongoDB connection...")

  const client = new MongoClient(encodedUri)

  try {
    await client.connect()
    console.log("✅ Connection successful!")

    const db = client.db(process.env.MONGODB_DB_NAME || "movieflix")
    await db.admin().ping()
    console.log("✅ Database access confirmed!")

    // List collections
    const collections = await db.listCollections().toArray()
    console.log(`📊 Found ${collections.length} collections:`)
    collections.forEach((col) => console.log(`   - ${col.name}`))
  } catch (error) {
    console.log("❌ Connection failed:")
    console.log(error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔧 Troubleshooting:")
      console.log("1. Start MongoDB: brew services start mongodb-community")
      console.log("2. Check if running: brew services list | grep mongodb")
    } else if (error.message.includes("Authentication failed")) {
      console.log("\n🔧 Troubleshooting:")
      console.log("1. Check username and password")
      console.log("2. Verify user exists in database")
      console.log("3. Check authentication database")
    }
  } finally {
    await client.close()
  }
}

validateMongoURI()

const { MongoClient } = require("mongodb")
const path = require("path")

// Load environment variables
function loadEnvironment() {
  const envFiles = [".env", ".env.production", ".env.local"]
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile)
    try {
      require("dotenv").config({ path: envPath, override: false })
    } catch (error) {
      // Continue to next file
    }
  }
}

loadEnvironment()

async function setupWatchlistCollection() {
  const rawUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME || "movieflix"

  if (!rawUri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    process.exit(1)
  }

  const client = new MongoClient(rawUri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(dbName)

    // Create watchlist collection if it doesn't exist
    const collections = await db.listCollections({ name: "watchlist" }).toArray()

    if (collections.length === 0) {
      console.log("📝 Creating watchlist collection...")
      await db.createCollection("watchlist")
      console.log("✅ Watchlist collection created")
    } else {
      console.log("✅ Watchlist collection already exists")
    }

    // Create comprehensive indexes
    console.log("📊 Creating watchlist indexes...")

    // Basic indexes
    await db.collection("watchlist").createIndex({ user_id: 1 })
    console.log("✅ Created user_id index")

    await db.collection("watchlist").createIndex({ movie_id: 1 })
    console.log("✅ Created movie_id index")

    // Compound unique index to prevent duplicate entries
    await db.collection("watchlist").createIndex({ user_id: 1, movie_id: 1 }, { unique: true })
    console.log("✅ Created unique compound user_id + movie_id index")

    // Status-based queries
    await db.collection("watchlist").createIndex({ user_id: 1, status: 1 })
    console.log("✅ Created user_id + status compound index")

    // Date-based sorting
    await db.collection("watchlist").createIndex({ added_date: -1 })
    console.log("✅ Created added_date descending index")

    // User's watchlist with status filtering
    await db.collection("watchlist").createIndex({ user_id: 1, added_date: -1 })
    console.log("✅ Created user_id + added_date compound index")

    // Update all existing collection indexes
    console.log("📊 Updating all collection indexes...")

    // Movies collection indexes
    await db.collection("movies").createIndex({ title: "text", plot: "text", fullplot: "text" })
    await db.collection("movies").createIndex({ genres: 1 })
    await db.collection("movies").createIndex({ year: 1 })
    await db.collection("movies").createIndex({ "imdb.rating": -1 })
    await db.collection("movies").createIndex({ released: -1 })
    console.log("✅ Updated movies collection indexes")

    // Comments collection indexes
    await db.collection("comments").createIndex({ movie_id: 1 })
    await db.collection("comments").createIndex({ date: -1 })
    console.log("✅ Updated comments collection indexes")

    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    console.log("✅ Updated users collection indexes")

    // Theaters collection indexes
    await db.collection("theaters").createIndex({ "location.geo": "2dsphere" })
    console.log("✅ Updated theaters collection indexes")

    // Get collection statistics
    console.log("\n📊 Collection Statistics:")
    const collections_list = ["movies", "users", "comments", "theaters", "watchlist"]

    for (const collectionName of collections_list) {
      try {
        const count = await db.collection(collectionName).countDocuments()
        const indexes = await db.collection(collectionName).indexes()
        console.log(`📁 ${collectionName}: ${count} documents, ${indexes.length} indexes`)

        // Show index details
        indexes.forEach((index) => {
          console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
        })
      } catch (error) {
        console.log(`❌ Error getting stats for ${collectionName}: ${error.message}`)
      }
    }

    console.log("\n🎉 Watchlist setup completed successfully!")
    console.log("\n📋 What's been set up:")
    console.log("✅ Watchlist collection created")
    console.log("✅ Optimized indexes for fast queries")
    console.log("✅ Unique constraints to prevent duplicates")
    console.log("✅ All collection indexes updated")
    console.log("\n🚀 Your app now supports:")
    console.log("• Add/remove movies from watchlist")
    console.log("• Track watch status (want to watch, watching, watched)")
    console.log("• Fast user-specific queries")
    console.log("• Prevent duplicate entries")
    console.log("• Efficient sorting and filtering")
  } catch (error) {
    console.error("❌ Error setting up watchlist:", error.message)

    if (error.message.includes("E11000")) {
      console.log("\n💡 Duplicate key error - this is normal if running the script multiple times")
    }

    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run the script
if (require.main === module) {
  setupWatchlistCollection()
}

module.exports = { setupWatchlistCollection }

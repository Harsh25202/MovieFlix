const { MongoClient } = require("mongodb")
const path = require("path")

// Load environment variables in correct order: .env, .env.production, .env.local
function loadEnvironment() {
  const envFiles = [".env", ".env.production", ".env.local"]

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile)
    try {
      require("dotenv").config({ path: envPath, override: false }) // Don't override existing vars
      console.log(`📁 Loaded environment from: ${envFile}`)
    } catch (error) {
      // Continue to next file
    }
  }
}

// Function to properly encode MongoDB URI (avoid double encoding)
function encodeMongoURI(uri) {
  if (!uri) return uri

  try {
    // Check if URI is already encoded by looking for %40 (encoded @)
    if (uri.includes("%40") || uri.includes("%23") || uri.includes("%25")) {
      console.log(`🔐 URI appears to be already encoded`)
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

      console.log(`🔐 Encoded credentials in MongoDB URI`)
      return url.toString()
    }

    return uri
  } catch (error) {
    console.log(`⚠️  Could not parse URI, using as-is: ${error.message}`)
    return uri
  }
}

// Function to create a safe URI for logging (hide credentials)
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

// Load environment
loadEnvironment()

console.log("🔍 Environment Variables:")
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? "Set" : "Not set"}`)
console.log(`MONGODB_DB_NAME: ${process.env.MONGODB_DB_NAME || "Not set"}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`)

const sampleMovies = [
  {
    title: "The Great Train Robbery",
    plot: "A group of bandits stage a brazen train hold-up, only to find a determined posse hot on their heels.",
    fullplot:
      "Among the earliest existing films in American cinema - notable as the first film that presented a narrative story to tell - it depicts a group of cowboy outlaws who hold up a train and rob the passengers. They are then pursued by a Sheriff's posse. Several scenes have color included - all hand tinted.",
    genres: ["Short", "Western"],
    runtime: 11,
    cast: ["A.C. Abadie", "Gilbert M. 'Broncho Billy' Anderson", "George Barnes", "Justus D. Barnes"],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMTU3NjE5NzYtYTYyNS00MDVmLWIwYjgtMmYwYWIxZDYyNzU2XkEyXkFqcGdeQXVyNzQzNzQxNzI@._V1_SY1000_SX677_AL_.jpg",
    year: 1903,
    rated: "TV-G",
    imdb: { rating: 7.4, votes: 9847, id: 439 },
    countries: ["USA"],
    languages: ["English"],
    directors: ["Edwin S. Porter"],
    num_mflix_comments: 0,
    released: new Date("1903-12-01"),
    awards: { wins: 1, nominations: 0, text: "1 win." },
    type: "movie",
  },
  {
    title: "The Perils of Pauline",
    plot: "Young Pauline is left a lot of money when her wealthy uncle dies. However, her uncle's secretary has been named as her guardian until she marries.",
    fullplot:
      "Young Pauline is left a lot of money when her wealthy uncle dies. However, her uncle's secretary has been named as her guardian until she marries, at which time she will officially take possession of her inheritance. Meanwhile, her 'guardian' and his confederates constantly come up with schemes to get rid of Pauline so that he can get his hands on the money himself.",
    genres: ["Action"],
    runtime: 199,
    cast: ["Pearl White", "Crane Wilbur", "Paul Panzer", "Edward Josè"],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMzgxODk1Mzk2Ml5BMl5BanBnXkFtZTgwMDg0NzkwMjE@._V1_SY1000_SX677_AL_.jpg",
    year: 1914,
    imdb: { rating: 7.6, votes: 744, id: 4465 },
    countries: ["USA"],
    languages: ["English"],
    directors: ["Louis J. Gasnier", "Donald MacKenzie"],
    num_mflix_comments: 0,
    released: new Date("1914-03-23"),
    awards: { wins: 1, nominations: 0, text: "1 win." },
    type: "movie",
  },
  {
    title: "Metropolis",
    plot: "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working class prophet.",
    fullplot:
      "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working class prophet who predicts the coming of a savior to mediate their differences.",
    genres: ["Drama", "Sci-Fi"],
    runtime: 153,
    cast: ["Alfred Abel", "Gustav Fröhlich", "Rudolf Klein-Rogge", "Fritz Rasp"],
    poster:
      "https://m.media-amazon.com/images/M/MV5BMTYyOTM2NTMxNV5BMl5BanBnXkFtZTcwNzQ0NjMyNA@@._V1_SY1000_SX677_AL_.jpg",
    year: 1927,
    rated: "Not Rated",
    imdb: { rating: 8.3, votes: 169000, id: 17136 },
    countries: ["Germany"],
    languages: ["German"],
    directors: ["Fritz Lang"],
    num_mflix_comments: 0,
    released: new Date("1927-01-10"),
    awards: { wins: 3, nominations: 4, text: "3 wins & 4 nominations." },
    type: "movie",
  },
]

const sampleTheaters = [
  {
    theaterId: 1001,
    location: {
      address: {
        street1: "123 Main Street",
        city: "New York",
        state: "NY",
        zipcode: "10001",
      },
      geo: {
        type: "Point",
        coordinates: [-74.006, 40.7128],
      },
    },
  },
  {
    theaterId: 1002,
    location: {
      address: {
        street1: "456 Hollywood Blvd",
        city: "Los Angeles",
        state: "CA",
        zipcode: "90028",
      },
      geo: {
        type: "Point",
        coordinates: [-118.2437, 34.0522],
      },
    },
  },
  {
    theaterId: 1003,
    location: {
      address: {
        street1: "789 Michigan Ave",
        city: "Chicago",
        state: "IL",
        zipcode: "60611",
      },
      geo: {
        type: "Point",
        coordinates: [-87.6298, 41.8781],
      },
    },
  },
]

const sampleUsers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "$2b$12$NzpbWHdMytemLtTfFKduHenr2NZ.rvxIKuYM4AWLTFaUShxbJ.G3q", // password: "password123"
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "$2b$12$NzpbWHdMytemLtTfFKduHenr2NZ.rvxIKuYM4AWLTFaUShxbJ.G3q", // password: "password123"
  },
]

async function seedDatabase() {
  const rawUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME || "movieflix"

  if (!rawUri) {
    console.error("❌ MONGODB_URI not found in environment variables")
    console.log("📝 Please check your environment files contain:")
    console.log("MONGODB_URI=mongodb://localhost:27017/movieflix")
    console.log("MONGODB_DB_NAME=movieflix")
    console.log("\n💡 Environment files are loaded in this order:")
    console.log("1. .env (base configuration)")
    console.log("2. .env.production (production overrides)")
    console.log("3. .env.local (local overrides - highest priority)")
    process.exit(1)
  }

  // Encode the URI to handle special characters in username/password
  const uri = encodeMongoURI(rawUri)
  const safeLogUri = createSafeLogURI(uri)

  console.log("🌱 Starting database seeding...")
  console.log(`📡 Connecting to: ${safeLogUri}`)

  const client = new MongoClient(uri)

  try {
    // Test connection first
    console.log("🔌 Testing MongoDB connection...")
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(dbName)

    // Test database access
    await db.admin().ping()
    console.log("✅ Database access confirmed")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.collection("movies").deleteMany({})
    await db.collection("theaters").deleteMany({})
    await db.collection("users").deleteMany({})
    await db.collection("comments").deleteMany({})

    // Insert sample data
    console.log("📽️  Inserting movies...")
    const movieResult = await db.collection("movies").insertMany(sampleMovies)
    console.log(`✅ Inserted ${movieResult.insertedCount} movies`)

    console.log("🎭 Inserting theaters...")
    const theaterResult = await db.collection("theaters").insertMany(sampleTheaters)
    console.log(`✅ Inserted ${theaterResult.insertedCount} theaters`)

    console.log("👥 Inserting users...")
    const userResult = await db.collection("users").insertMany(sampleUsers)
    console.log(`✅ Inserted ${userResult.insertedCount} users`)

    // Insert sample comments
    const movieIds = Object.values(movieResult.insertedIds)
    const sampleComments = [
      {
        name: "Movie Enthusiast",
        email: "enthusiast@example.com",
        movie_id: movieIds[0],
        text: "This is a groundbreaking film that started the narrative cinema tradition. Absolutely fascinating to watch!",
        date: new Date(),
      },
      {
        name: "Classic Film Lover",
        email: "classic@example.com",
        movie_id: movieIds[0],
        text: "The train robbery scene is iconic. You can see how this influenced countless westerns that followed.",
        date: new Date(),
      },
      {
        name: "Silent Film Fan",
        email: "silent@example.com",
        movie_id: movieIds[1],
        text: "Pearl White was amazing in this serial. The action sequences were quite advanced for 1914!",
        date: new Date(),
      },
    ]

    console.log("💬 Inserting comments...")
    const commentResult = await db.collection("comments").insertMany(sampleComments)
    console.log(`✅ Inserted ${commentResult.insertedCount} comments`)

    // Update comment counts
    console.log("🔄 Updating movie comment counts...")
    for (const movieId of movieIds) {
      const commentCount = await db.collection("comments").countDocuments({ movie_id: movieId })
      await db.collection("movies").updateOne({ _id: movieId }, { $set: { num_mflix_comments: commentCount } })
    }

    // Create indexes for better performance
    console.log("📊 Creating database indexes...")
    await db.collection("movies").createIndex({ title: "text", plot: "text", fullplot: "text" })
    await db.collection("movies").createIndex({ genres: 1 })
    await db.collection("movies").createIndex({ year: 1 })
    await db.collection("movies").createIndex({ "imdb.rating": -1 })
    await db.collection("comments").createIndex({ movie_id: 1 })
    await db.collection("comments").createIndex({ date: -1 })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("theaters").createIndex({ "location.geo": "2dsphere" })

    console.log("✅ Database seeding completed successfully!")
    console.log("\n📊 Database Summary:")
    console.log(`   Movies: ${movieResult.insertedCount}`)
    console.log(`   Theaters: ${theaterResult.insertedCount}`)
    console.log(`   Users: ${userResult.insertedCount}`)
    console.log(`   Comments: ${commentResult.insertedCount}`)
    console.log("\n🚀 You can now start the application with: npm run dev:https")
  } catch (error) {
    console.error("❌ Error seeding database:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔧 MongoDB Connection Troubleshooting:")
      console.log("1. Check if MongoDB is running:")
      console.log("   brew services list | grep mongodb")
      console.log("2. Start MongoDB if not running:")
      console.log("   brew services start mongodb-community")
      console.log("3. Check if port 27017 is available:")
      console.log("   lsof -i :27017")
    } else if (error.message.includes("Authentication failed")) {
      console.log("\n🔐 Authentication Troubleshooting:")
      console.log("1. Check your username and password in environment files")
      console.log("2. Ensure special characters in password are properly handled")
      console.log("3. Try connecting manually:")
      console.log(`   mongosh "${safeLogUri}"`)
    } else if (error.message.includes("Invalid connection string")) {
      console.log("\n🔗 Connection String Troubleshooting:")
      console.log("1. Check your MONGODB_URI format in environment files")
      console.log("2. For local MongoDB: mongodb://localhost:27017/movieflix")
      console.log("3. For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database")
      console.log("4. Special characters in password are automatically encoded")
    }

    process.exit(1)
  } finally {
    await client.close()
  }
}

seedDatabase()

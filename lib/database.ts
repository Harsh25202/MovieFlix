import { dummyMovies, dummyUsers, dummyComments, dummyWatchlist } from "./dummy-data"

export interface Movie {
  _id: string
  title: string
  year: number
  rated: string
  released: string
  runtime: string
  genre: string[]
  director: string
  writer: string
  actors: string
  plot: string
  language: string
  country: string
  awards: string
  poster: string
  ratings: Array<{
    Source: string
    Value: string
  }>
  metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  type: string
  dvd?: string
  boxOffice?: string
  production?: string
  website?: string
}

export interface User {
  _id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

export interface Comment {
  _id: string
  name: string
  email: string
  movie_id: string
  text: string
  date: Date
}

export interface WatchlistItem {
  _id: string
  userId: string
  movieId: string
  addedAt: Date
}

// Check if we're in Edge Runtime or if MongoDB is available
function isEdgeRuntime() {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.CF_PAGES === "1" ||
    typeof window !== "undefined" ||
    !process.env.MONGODB_URI
  )
}

// Lazy load MongoDB only when needed and available
let MongoClient: any = null
let ObjectId: any = null

async function getMongoClient() {
  if (isEdgeRuntime()) {
    console.log("🌐 Edge Runtime detected - using dummy data")
    return null
  }

  try {
    if (!MongoClient) {
      const mongodb = require("mongodb")
      MongoClient = mongodb.MongoClient
      ObjectId = mongodb.ObjectId
    }
    return MongoClient
  } catch (error) {
    console.log("⚠️ MongoDB not available - using dummy data")
    return null
  }
}

export class DatabaseService {
  private static client: any = null
  private static db: any = null

  private static async connect() {
    if (isEdgeRuntime()) {
      return null
    }

    const Client = await getMongoClient()
    if (!Client) {
      return null
    }

    if (!this.client) {
      try {
        this.client = new Client(process.env.MONGODB_URI)
        await this.client.connect()
        this.db = this.client.db(process.env.MONGODB_DB_NAME || "movieflix")
        console.log("✅ Connected to MongoDB")
      } catch (error) {
        console.error("❌ MongoDB connection failed:", error)
        this.client = null
        this.db = null
      }
    }
    return this.db
  }

  // Movies
  static async getMovies(page = 1, limit = 20, search?: string, genre?: string) {
    const db = await this.connect()
    if (!db) {
      // Fallback to dummy data
      let filteredMovies = [...dummyMovies]

      if (search) {
        filteredMovies = filteredMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(search.toLowerCase()) ||
            movie.plot.toLowerCase().includes(search.toLowerCase()),
        )
      }

      if (genre && genre !== "all") {
        filteredMovies = filteredMovies.filter((movie) =>
          movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
        )
      }

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedMovies = filteredMovies.slice(startIndex, endIndex)

      return {
        movies: paginatedMovies,
        totalCount: filteredMovies.length,
        totalPages: Math.ceil(filteredMovies.length / limit),
        currentPage: page,
      }
    }

    try {
      const collection = db.collection("movies")
      const query: any = {}

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { plot: { $regex: search, $options: "i" } },
          { actors: { $regex: search, $options: "i" } },
          { director: { $regex: search, $options: "i" } },
        ]
      }

      if (genre && genre !== "all") {
        query.genre = { $in: [new RegExp(genre, "i")] }
      }

      const totalCount = await collection.countDocuments(query)
      const movies = await collection
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray()

      return {
        movies,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
      throw error
    }
  }

  static async getMovieById(id: string) {
    const db = await this.connect()
    if (!db) {
      return dummyMovies.find((movie) => movie._id === id) || null
    }

    try {
      const collection = db.collection("movies")
      return await collection.findOne({ _id: id })
    } catch (error) {
      console.error("Error fetching movie:", error)
      return null
    }
  }

  static async getMoviesByGenre(genre: string, limit = 10) {
    const db = await this.connect()
    if (!db) {
      return dummyMovies
        .filter((movie) => movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()))
        .slice(0, limit)
    }

    try {
      const collection = db.collection("movies")
      return await collection
        .find({ genre: { $in: [new RegExp(genre, "i")] } })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error("Error fetching movies by genre:", error)
      return []
    }
  }

  static async getFeaturedMovies(limit = 6) {
    const db = await this.connect()
    if (!db) {
      return dummyMovies.filter((movie) => Number.parseFloat(movie.imdbRating) >= 8.0).slice(0, limit)
    }

    try {
      const collection = db.collection("movies")
      return await collection
        .find({ imdbRating: { $gte: "8.0" } })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error("Error fetching featured movies:", error)
      return []
    }
  }

  static async getPopularMovies(limit = 10) {
    const db = await this.connect()
    if (!db) {
      return dummyMovies
        .sort((a, b) => Number.parseFloat(b.imdbRating) - Number.parseFloat(a.imdbRating))
        .slice(0, limit)
    }

    try {
      const collection = db.collection("movies")
      return await collection.find({}).sort({ imdbRating: -1 }).limit(limit).toArray()
    } catch (error) {
      console.error("Error fetching popular movies:", error)
      return []
    }
  }

  static async getRecentMovies(limit = 10) {
    const db = await this.connect()
    if (!db) {
      return dummyMovies.sort((a, b) => Number.parseInt(b.year) - Number.parseInt(a.year)).slice(0, limit)
    }

    try {
      const collection = db.collection("movies")
      return await collection.find({}).sort({ year: -1 }).limit(limit).toArray()
    } catch (error) {
      console.error("Error fetching recent movies:", error)
      return []
    }
  }

  static async searchMovies(query: string, limit = 20) {
    const db = await this.connect()
    if (!db) {
      return dummyMovies
        .filter(
          (movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.plot.toLowerCase().includes(query.toLowerCase()) ||
            movie.actors.toLowerCase().includes(query.toLowerCase()) ||
            movie.director.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, limit)
    }

    try {
      const collection = db.collection("movies")
      return await collection
        .find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { plot: { $regex: query, $options: "i" } },
            { actors: { $regex: query, $options: "i" } },
            { director: { $regex: query, $options: "i" } },
          ],
        })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error("Error searching movies:", error)
      return []
    }
  }

  // Users
  static async createUser(userData: Omit<User, "_id" | "createdAt">) {
    const db = await this.connect()
    if (!db) {
      const newUser: User = {
        _id: `user_${Date.now()}`,
        ...userData,
        createdAt: new Date(),
      }
      return newUser
    }

    try {
      const collection = db.collection("users")
      const newUser = {
        ...userData,
        createdAt: new Date(),
      }
      const result = await collection.insertOne(newUser)
      return { _id: result.insertedId, ...newUser }
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  static async getUserByEmail(email: string) {
    const db = await this.connect()
    if (!db) {
      return dummyUsers.find((user) => user.email === email) || null
    }

    try {
      const collection = db.collection("users")
      return await collection.findOne({ email })
    } catch (error) {
      console.error("Error fetching user by email:", error)
      return null
    }
  }

  static async getUserById(id: string) {
    const db = await this.connect()
    if (!db) {
      return dummyUsers.find((user) => user._id === id) || null
    }

    try {
      const collection = db.collection("users")
      const query = ObjectId && ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id }
      return await collection.findOne(query)
    } catch (error) {
      console.error("Error fetching user by ID:", error)
      return null
    }
  }

  // Comments
  static async addComment(commentData: Omit<Comment, "_id">) {
    const db = await this.connect()
    if (!db) {
      const newComment: Comment = {
        _id: `comment_${Date.now()}`,
        ...commentData,
      }
      return newComment
    }

    try {
      const collection = db.collection("comments")
      const result = await collection.insertOne(commentData)
      return { _id: result.insertedId, ...commentData }
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  }

  static async getCommentsByMovieId(movieId: string) {
    const db = await this.connect()
    if (!db) {
      return dummyComments.filter((comment) => comment.movie_id === movieId)
    }

    try {
      const collection = db.collection("comments")
      return await collection.find({ movie_id: movieId }).sort({ date: -1 }).toArray()
    } catch (error) {
      console.error("Error fetching comments:", error)
      return []
    }
  }

  // Watchlist
  static async addToWatchlist(userId: string, movieId: string) {
    const db = await this.connect()
    if (!db) {
      const existingItem = dummyWatchlist.find((item) => item.userId === userId && item.movieId === movieId)

      if (existingItem) {
        throw new Error("Movie already in watchlist")
      }

      const newItem: WatchlistItem = {
        _id: `watchlist_${Date.now()}`,
        userId,
        movieId,
        addedAt: new Date(),
      }

      return newItem
    }

    try {
      const collection = db.collection("watchlist")

      // Check if already exists
      const existing = await collection.findOne({ userId, movieId })
      if (existing) {
        throw new Error("Movie already in watchlist")
      }

      const watchlistItem = {
        userId,
        movieId,
        addedAt: new Date(),
      }

      const result = await collection.insertOne(watchlistItem)
      return { _id: result.insertedId, ...watchlistItem }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
      throw error
    }
  }

  static async removeFromWatchlist(userId: string, movieId: string) {
    const db = await this.connect()
    if (!db) {
      return { success: true }
    }

    try {
      const collection = db.collection("watchlist")
      await collection.deleteOne({ userId, movieId })
      return { success: true }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
      throw error
    }
  }

  static async getWatchlist(userId: string) {
    const db = await this.connect()
    if (!db) {
      const watchlistItems = dummyWatchlist.filter((item) => item.userId === userId)
      const movies = watchlistItems
        .map((item) => dummyMovies.find((movie) => movie._id === item.movieId))
        .filter(Boolean)

      return movies
    }

    try {
      const watchlistCollection = db.collection("watchlist")
      const moviesCollection = db.collection("movies")

      const watchlistItems = await watchlistCollection.find({ userId }).toArray()

      const movieIds = watchlistItems.map((item) => item.movieId)
      const movies = await moviesCollection.find({ _id: { $in: movieIds } }).toArray()

      return movies
    } catch (error) {
      console.error("Error fetching watchlist:", error)
      return []
    }
  }

  static async isInWatchlist(userId: string, movieId: string) {
    const db = await this.connect()
    if (!db) {
      return dummyWatchlist.some((item) => item.userId === userId && item.movieId === movieId)
    }

    try {
      const collection = db.collection("watchlist")
      const item = await collection.findOne({ userId, movieId })
      return !!item
    } catch (error) {
      console.error("Error checking watchlist:", error)
      return false
    }
  }

  // Database stats
  static async getDatabaseStats() {
    const db = await this.connect()
    if (!db) {
      return {
        movies: dummyMovies.length,
        users: dummyUsers.length,
        comments: dummyComments.length,
        watchlistItems: dummyWatchlist.length,
      }
    }

    try {
      const [movies, users, comments, watchlistItems] = await Promise.all([
        db.collection("movies").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("comments").countDocuments(),
        db.collection("watchlist").countDocuments(),
      ])

      return { movies, users, comments, watchlistItems }
    } catch (error) {
      console.error("Error fetching database stats:", error)
      return { movies: 0, users: 0, comments: 0, watchlistItems: 0 }
    }
  }

  static async createIndexes() {
    const db = await this.connect()
    if (!db) {
      console.log("✅ Indexes created (dummy data)")
      return { success: true }
    }

    try {
      await Promise.all([
        db.collection("movies").createIndex({ title: "text", plot: "text", actors: "text" }),
        db.collection("movies").createIndex({ genre: 1 }),
        db.collection("movies").createIndex({ imdbRating: -1 }),
        db.collection("movies").createIndex({ year: -1 }),
        db.collection("users").createIndex({ email: 1 }, { unique: true }),
        db.collection("comments").createIndex({ movie_id: 1 }),
        db.collection("watchlist").createIndex({ userId: 1, movieId: 1 }, { unique: true }),
      ])

      console.log("✅ Database indexes created")
      return { success: true }
    } catch (error) {
      console.error("Error creating indexes:", error)
      throw error
    }
  }
}

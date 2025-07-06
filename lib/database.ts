import { ObjectId } from "mongodb"
import { getDatabase } from "./mongodb"
import { dummyMovies, dummyComments, dummyTheaters, dummyUsers } from "./dummy-data"

// Ensure this only runs on the server
if (typeof window !== "undefined") {
  throw new Error("Database service should only be used on the server side")
}

// Types based on your MongoDB structure
export interface Movie {
  _id: string
  title: string
  plot: string
  fullplot?: string
  genres: string[]
  runtime: number
  cast: string[]
  poster: string
  year: number
  rated?: string
  imdb: {
    rating: number
    votes: number
    id: number
  }
  countries: string[]
  languages: string[]
  directors: string[]
  num_mflix_comments: number
  released?: Date
  awards?: {
    wins: number
    nominations: number
    text: string
  }
  tomatoes?: {
    viewer?: {
      rating: number
      numReviews: number
      meter?: number
    }
    critic?: {
      rating: number
      numReviews: number
      meter: number
    }
    fresh?: number
    rotten?: number
    lastUpdated?: Date
  }
}

export interface Comment {
  _id: string
  name: string
  email: string
  movie_id: string
  text: string
  date: Date
}

export interface Theater {
  _id: string
  theaterId: number
  location: {
    address: {
      street1: string
      city: string
      state: string
      zipcode: string
    }
    geo: {
      type: string
      coordinates: [number, number]
    }
  }
}

export interface User {
  _id: string
  name: string
  email: string
  password: string
}

export interface Session {
  _id: string
  user_id: string
  jwt: string
}

// New Watchlist interface
export interface WatchlistItem {
  _id: string
  user_id: string
  movie_id: string
  added_date: Date
  status: "want_to_watch" | "watching" | "watched"
  rating?: number
  notes?: string
}

// Extended Movie interface with watchlist info
export interface MovieWithWatchlist extends Movie {
  isInWatchlist?: boolean
  watchlistStatus?: "want_to_watch" | "watching" | "watched"
  userRating?: number
}

// MongoDB document types (with ObjectId)
interface MongoMovie {
  _id: ObjectId
  title: string
  plot: string
  fullplot?: string
  genres: string[]
  runtime: number
  cast: string[]
  poster: string
  year: number
  rated?: string
  imdb: {
    rating: number
    votes: number
    id: number
  }
  countries: string[]
  languages: string[]
  directors: string[]
  num_mflix_comments: number
  released?: Date
  awards?: {
    wins: number
    nominations: number
    text: string
  }
  tomatoes?: {
    viewer?: {
      rating: number
      numReviews: number
      meter?: number
    }
    critic?: {
      rating: number
      numReviews: number
      meter: number
    }
    fresh?: number
    rotten?: number
    lastUpdated?: Date
  }
}

interface MongoTheater {
  _id: ObjectId
  theaterId: number
  location: {
    address: {
      street1: string
      city: string
      state: string
      zipcode: string
    }
    geo: {
      type: string
      coordinates: [number, number]
    }
  }
}

interface MongoComment {
  _id: ObjectId
  name: string
  email: string
  movie_id: ObjectId
  text: string
  date: Date
}

interface MongoUser {
  _id: ObjectId
  name: string
  email: string
  password: string
}

interface MongoWatchlistItem {
  _id: ObjectId
  user_id: ObjectId
  movie_id: ObjectId
  added_date: Date
  status: "want_to_watch" | "watching" | "watched"
  rating?: number
  notes?: string
}

// Helper function to check if MongoDB is available
async function isMongoAvailable(): Promise<boolean> {
  if (!process.env.MONGODB_URI) {
    console.log("📝 No MONGODB_URI environment variable found")
    console.log("📝 Using dummy data as fallback")
    return false
  }

  try {
    console.log("🔍 Checking MongoDB availability...")
    const db = await getDatabase()
    if (db) {
      console.log("✅ MongoDB is available and connected")
      return true
    } else {
      console.log("❌ MongoDB connection failed - using dummy data")
      return false
    }
  } catch (error) {
    console.log("❌ MongoDB error - using dummy data:", error.message)
    return false
  }
}

// Helper function to limit data for non-authenticated users
function limitMovieData(movie: Movie, isAuthenticated: boolean): Movie {
  if (isAuthenticated) {
    return movie
  }

  // For non-authenticated users, limit the data
  return {
    ...movie,
    plot: movie.plot.substring(0, 100) + "...", // Truncate plot
    fullplot: undefined, // Remove full plot
    cast: movie.cast.slice(0, 2), // Show only first 2 cast members
    directors: movie.directors.slice(0, 1), // Show only first director
  }
}

// Database service - uses dummy data as fallback, MongoDB when available
export class DatabaseService {
  static async getMovies(
    limit = 20,
    skip = 0,
    isAuthenticated = false,
    userId?: string,
  ): Promise<MovieWithWatchlist[]> {
    console.log(`🎬 Fetching ${limit} movies (skip: ${skip}, authenticated: ${isAuthenticated})`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for movies")
        const movies = dummyMovies.slice(skip, skip + limit)
        return movies.map((movie) => limitMovieData(movie, isAuthenticated))
      }

      console.log("📡 Fetching movies from MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        const movies = dummyMovies.slice(skip, skip + limit)
        return movies.map((movie) => limitMovieData(movie, isAuthenticated))
      }

      // For non-authenticated users, limit the number of movies
      const actualLimit = isAuthenticated ? limit : Math.min(limit, 6)

      const movies = await db.collection<MongoMovie>("movies").find({}).skip(skip).limit(actualLimit).toArray()
      console.log(`✅ Successfully fetched ${movies.length} movies from MongoDB Atlas`)

      const moviesWithWatchlist = await Promise.all(
        movies.map(async (movie): Promise<MovieWithWatchlist> => {
          const baseMovie = limitMovieData(
            {
              ...movie,
              _id: movie._id.toString(),
            },
            isAuthenticated,
          )

          // Add watchlist info if user is authenticated
          if (isAuthenticated && userId) {
            const watchlistItem = await this.getWatchlistItem(userId, movie._id.toString())
            return {
              ...baseMovie,
              isInWatchlist: !!watchlistItem,
              watchlistStatus: watchlistItem?.status,
              userRating: watchlistItem?.rating,
            }
          }

          return baseMovie
        }),
      )

      return moviesWithWatchlist
    } catch (error) {
      console.error("❌ Error fetching movies from MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      const movies = dummyMovies.slice(skip, skip + limit)
      return movies.map((movie) => limitMovieData(movie, isAuthenticated))
    }
  }

  static async getMovieById(id: string, isAuthenticated = false, userId?: string): Promise<MovieWithWatchlist | null> {
    console.log(`🎬 Fetching movie by ID: ${id} (authenticated: ${isAuthenticated})`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for movie details")
        const movie = dummyMovies.find((movie) => movie._id === id) || null
        return movie ? limitMovieData(movie, isAuthenticated) : null
      }

      console.log("📡 Fetching movie from MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        const movie = dummyMovies.find((movie) => movie._id === id) || null
        return movie ? limitMovieData(movie, isAuthenticated) : null
      }

      const movie = await db.collection<MongoMovie>("movies").findOne({ _id: new ObjectId(id) })

      if (!movie) {
        console.log(`❌ Movie not found in MongoDB: ${id}`)
        return null
      }

      console.log(`✅ Successfully fetched movie from MongoDB Atlas: ${movie.title}`)
      const baseMovie = limitMovieData(
        {
          ...movie,
          _id: movie._id.toString(),
        },
        isAuthenticated,
      )

      // Add watchlist info if user is authenticated
      if (isAuthenticated && userId) {
        const watchlistItem = await this.getWatchlistItem(userId, id)
        return {
          ...baseMovie,
          isInWatchlist: !!watchlistItem,
          watchlistStatus: watchlistItem?.status,
          userRating: watchlistItem?.rating,
        }
      }

      return baseMovie
    } catch (error) {
      console.error("❌ Error fetching movie from MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      const movie = dummyMovies.find((movie) => movie._id === id) || null
      return movie ? limitMovieData(movie, isAuthenticated) : null
    }
  }

  static async getMoviesByGenre(
    genre: string,
    isAuthenticated = false,
    userId?: string,
  ): Promise<MovieWithWatchlist[]> {
    console.log(`🎬 Fetching movies by genre: ${genre} (authenticated: ${isAuthenticated})`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for genre movies")
        const movies = dummyMovies.filter((movie) => movie.genres.includes(genre))
        return movies.map((movie) => limitMovieData(movie, isAuthenticated))
      }

      console.log("📡 Fetching genre movies from MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        const movies = dummyMovies.filter((movie) => movie.genres.includes(genre))
        return movies.map((movie) => limitMovieData(movie, isAuthenticated))
      }

      // Limit results for non-authenticated users
      const limit = isAuthenticated ? 10 : 4

      const movies = await db
        .collection<MongoMovie>("movies")
        .find({ genres: { $in: [genre] } })
        .limit(limit)
        .toArray()

      console.log(`✅ Successfully fetched ${movies.length} ${genre} movies from MongoDB Atlas`)

      const moviesWithWatchlist = await Promise.all(
        movies.map(async (movie): Promise<MovieWithWatchlist> => {
          const baseMovie = limitMovieData(
            {
              ...movie,
              _id: movie._id.toString(),
            },
            isAuthenticated,
          )

          // Add watchlist info if user is authenticated
          if (isAuthenticated && userId) {
            const watchlistItem = await this.getWatchlistItem(userId, movie._id.toString())
            return {
              ...baseMovie,
              isInWatchlist: !!watchlistItem,
              watchlistStatus: watchlistItem?.status,
              userRating: watchlistItem?.rating,
            }
          }

          return baseMovie
        }),
      )

      return moviesWithWatchlist
    } catch (error) {
      console.error("❌ Error fetching genre movies from MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      const movies = dummyMovies.filter((movie) => movie.genres.includes(genre))
      return movies.map((movie) => limitMovieData(movie, isAuthenticated))
    }
  }

  static async searchMovies(query: string, isAuthenticated = false, userId?: string): Promise<MovieWithWatchlist[]> {
    console.log(`🔍 Searching movies for: "${query}" (authenticated: ${isAuthenticated})`)

    if (!isAuthenticated) {
      // Non-authenticated users get limited search results
      console.log("🔒 Limited search for non-authenticated user")
      return []
    }

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for search")
        return dummyMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.plot.toLowerCase().includes(query.toLowerCase()),
        )
      }

      console.log("📡 Searching movies in MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        return dummyMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.plot.toLowerCase().includes(query.toLowerCase()),
        )
      }

      const movies = await db
        .collection<MongoMovie>("movies")
        .find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { plot: { $regex: query, $options: "i" } },
            { fullplot: { $regex: query, $options: "i" } },
            { cast: { $in: [new RegExp(query, "i")] } },
            { directors: { $in: [new RegExp(query, "i")] } },
          ],
        })
        .limit(20)
        .toArray()

      console.log(`✅ Successfully found ${movies.length} movies in MongoDB Atlas`)

      const moviesWithWatchlist = await Promise.all(
        movies.map(async (movie): Promise<MovieWithWatchlist> => {
          const baseMovie = {
            ...movie,
            _id: movie._id.toString(),
          }

          // Add watchlist info if user is authenticated
          if (userId) {
            const watchlistItem = await this.getWatchlistItem(userId, movie._id.toString())
            return {
              ...baseMovie,
              isInWatchlist: !!watchlistItem,
              watchlistStatus: watchlistItem?.status,
              userRating: watchlistItem?.rating,
            }
          }

          return baseMovie
        }),
      )

      return moviesWithWatchlist
    } catch (error) {
      console.error("❌ Error searching movies in MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      return dummyMovies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          movie.plot.toLowerCase().includes(query.toLowerCase()),
      )
    }
  }

  // Watchlist Methods
  static async addToWatchlist(
    userId: string,
    movieId: string,
    status: "want_to_watch" | "watching" | "watched" = "want_to_watch",
  ): Promise<WatchlistItem> {
    console.log(`📝 Adding movie ${movieId} to watchlist for user ${userId}`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for watchlist")
        // For dummy data, we'll just return a mock watchlist item
        return {
          _id: Date.now().toString(),
          user_id: userId,
          movie_id: movieId,
          added_date: new Date(),
          status,
        }
      }

      const db = await getDatabase()
      if (!db) {
        throw new Error("Database connection failed")
      }

      // Check if item already exists
      const existingItem = await db.collection<MongoWatchlistItem>("watchlist").findOne({
        user_id: new ObjectId(userId),
        movie_id: new ObjectId(movieId),
      })

      if (existingItem) {
        // Update existing item
        await db.collection("watchlist").updateOne(
          { _id: existingItem._id },
          {
            $set: {
              status,
              added_date: new Date(),
            },
          },
        )

        return {
          _id: existingItem._id.toString(),
          user_id: userId,
          movie_id: movieId,
          added_date: new Date(),
          status,
          rating: existingItem.rating,
          notes: existingItem.notes,
        }
      } else {
        // Create new item
        const result = await db.collection<Omit<MongoWatchlistItem, "_id">>("watchlist").insertOne({
          user_id: new ObjectId(userId),
          movie_id: new ObjectId(movieId),
          added_date: new Date(),
          status,
        })

        console.log(`✅ Successfully added to watchlist`)

        return {
          _id: result.insertedId.toString(),
          user_id: userId,
          movie_id: movieId,
          added_date: new Date(),
          status,
        }
      }
    } catch (error) {
      console.error("❌ Error adding to watchlist:", error)
      throw new Error("Failed to add to watchlist")
    }
  }

  static async removeFromWatchlist(userId: string, movieId: string): Promise<boolean> {
    console.log(`🗑️ Removing movie ${movieId} from watchlist for user ${userId}`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for watchlist removal")
        return true
      }

      const db = await getDatabase()
      if (!db) {
        throw new Error("Database connection failed")
      }

      const result = await db.collection("watchlist").deleteOne({
        user_id: new ObjectId(userId),
        movie_id: new ObjectId(movieId),
      })

      console.log(`✅ Successfully removed from watchlist`)
      return result.deletedCount > 0
    } catch (error) {
      console.error("❌ Error removing from watchlist:", error)
      throw new Error("Failed to remove from watchlist")
    }
  }

  static async getWatchlistItem(userId: string, movieId: string): Promise<WatchlistItem | null> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return null
      }

      const db = await getDatabase()
      if (!db) return null

      const item = await db.collection<MongoWatchlistItem>("watchlist").findOne({
        user_id: new ObjectId(userId),
        movie_id: new ObjectId(movieId),
      })

      if (!item) return null

      return {
        _id: item._id.toString(),
        user_id: item.user_id.toString(),
        movie_id: item.movie_id.toString(),
        added_date: item.added_date,
        status: item.status,
        rating: item.rating,
        notes: item.notes,
      }
    } catch (error) {
      console.error("❌ Error fetching watchlist item:", error)
      return null
    }
  }

  static async getUserWatchlist(
    userId: string,
    status?: "want_to_watch" | "watching" | "watched",
  ): Promise<MovieWithWatchlist[]> {
    console.log(`📋 Fetching watchlist for user ${userId}`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for user watchlist")
        return []
      }

      const db = await getDatabase()
      if (!db) return []

      // Build query
      const query: any = { user_id: new ObjectId(userId) }
      if (status) {
        query.status = status
      }

      const watchlistItems = await db
        .collection<MongoWatchlistItem>("watchlist")
        .find(query)
        .sort({ added_date: -1 })
        .toArray()

      // Get movie details for each watchlist item
      const moviesWithWatchlist = await Promise.all(
        watchlistItems.map(async (item): Promise<MovieWithWatchlist | null> => {
          const movie = await db.collection<MongoMovie>("movies").findOne({ _id: item.movie_id })

          if (!movie) return null

          return {
            ...movie,
            _id: movie._id.toString(),
            isInWatchlist: true,
            watchlistStatus: item.status,
            userRating: item.rating,
          }
        }),
      )

      // Filter out null values
      return moviesWithWatchlist.filter((movie): movie is MovieWithWatchlist => movie !== null)
    } catch (error) {
      console.error("❌ Error fetching user watchlist:", error)
      return []
    }
  }

  static async updateWatchlistItem(
    userId: string,
    movieId: string,
    updates: Partial<Pick<WatchlistItem, "status" | "rating" | "notes">>,
  ): Promise<boolean> {
    console.log(`📝 Updating watchlist item for user ${userId}, movie ${movieId}`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return true
      }

      const db = await getDatabase()
      if (!db) return false

      const result = await db.collection("watchlist").updateOne(
        {
          user_id: new ObjectId(userId),
          movie_id: new ObjectId(movieId),
        },
        { $set: updates },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("❌ Error updating watchlist item:", error)
      return false
    }
  }

  static async getCommentsByMovieId(movieId: string, isAuthenticated = false): Promise<Comment[]> {
    console.log(`💬 Fetching comments for movie: ${movieId} (authenticated: ${isAuthenticated})`)

    if (!isAuthenticated) {
      // Non-authenticated users can't see comments
      console.log("🔒 Comments hidden for non-authenticated user")
      return []
    }

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for comments")
        return dummyComments.filter((comment) => comment.movie_id === movieId)
      }

      console.log("📡 Fetching comments from MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        return dummyComments.filter((comment) => comment.movie_id === movieId)
      }

      const comments = await db
        .collection<MongoComment>("comments")
        .find({ movie_id: new ObjectId(movieId) })
        .sort({ date: -1 })
        .toArray()

      console.log(`✅ Successfully fetched ${comments.length} comments from MongoDB Atlas`)

      return comments.map(
        (comment): Comment => ({
          ...comment,
          _id: comment._id.toString(),
          movie_id: comment.movie_id.toString(),
        }),
      )
    } catch (error) {
      console.error("❌ Error fetching comments from MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      return dummyComments.filter((comment) => comment.movie_id === movieId)
    }
  }

  static async addComment(comment: Omit<Comment, "_id">): Promise<Comment> {
    console.log(`💬 Adding comment for movie: ${comment.movie_id}`)

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Adding comment to dummy data")
        const newComment: Comment = {
          ...comment,
          _id: Date.now().toString(),
          date: new Date(),
        }
        dummyComments.push(newComment)
        return newComment
      }

      console.log("📡 Adding comment to MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        const newComment: Comment = {
          ...comment,
          _id: Date.now().toString(),
          date: new Date(),
        }
        dummyComments.push(newComment)
        return newComment
      }

      const result = await db.collection<Omit<MongoComment, "_id">>("comments").insertOne({
        name: comment.name,
        email: comment.email,
        movie_id: new ObjectId(comment.movie_id),
        text: comment.text,
        date: new Date(),
      })

      console.log(`✅ Successfully added comment to MongoDB Atlas`)

      return {
        ...comment,
        _id: result.insertedId.toString(),
        date: new Date(),
      }
    } catch (error) {
      console.error("❌ Error adding comment to MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      // Fallback to dummy data
      const newComment: Comment = {
        ...comment,
        _id: Date.now().toString(),
        date: new Date(),
      }
      dummyComments.push(newComment)
      return newComment
    }
  }

  static async getTheaters(): Promise<Theater[]> {
    console.log("🎭 Fetching theaters")

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for theaters")
        return dummyTheaters
      }

      console.log("📡 Fetching theaters from MongoDB Atlas...")
      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, using dummy data")
        return dummyTheaters
      }

      const theaters = await db.collection<MongoTheater>("theaters").find({}).toArray()
      console.log(`✅ Successfully fetched ${theaters.length} theaters from MongoDB Atlas`)

      return theaters.map(
        (theater): Theater => ({
          _id: theater._id.toString(),
          theaterId: theater.theaterId,
          location: {
            address: {
              street1: theater.location.address.street1,
              city: theater.location.address.city,
              state: theater.location.address.state,
              zipcode: theater.location.address.zipcode,
            },
            geo: {
              type: theater.location.geo.type,
              coordinates: theater.location.geo.coordinates,
            },
          },
        }),
      )
    } catch (error) {
      console.error("❌ Error fetching theaters from MongoDB:", error)
      console.log("🔄 Falling back to dummy data")
      return dummyTheaters
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return dummyUsers.find((user) => user.email === email) || null
      }

      const db = await getDatabase()
      if (!db) return dummyUsers.find((user) => user.email === email) || null

      const user = await db.collection<MongoUser>("users").findOne({ email })

      if (!user) return null

      return {
        ...user,
        _id: user._id.toString(),
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      return dummyUsers.find((user) => user.email === email) || null
    }
  }

  static async createUser(userData: Omit<User, "_id">): Promise<User> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        const newUser: User = {
          ...userData,
          _id: Date.now().toString(),
        }
        dummyUsers.push(newUser)
        return newUser
      }

      const db = await getDatabase()
      if (!db) {
        const newUser: User = {
          ...userData,
          _id: Date.now().toString(),
        }
        dummyUsers.push(newUser)
        return newUser
      }

      const result = await db.collection<Omit<MongoUser, "_id">>("users").insertOne({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      })

      return {
        ...userData,
        _id: result.insertedId.toString(),
      }
    } catch (error) {
      console.error("Error creating user:", error)
      throw new Error("Failed to create user")
    }
  }

  static async updateMovieCommentCount(movieId: string): Promise<void> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return
      }

      const db = await getDatabase()
      if (!db) return

      const commentCount = await db.collection("comments").countDocuments({ movie_id: new ObjectId(movieId) })

      await db
        .collection("movies")
        .updateOne({ _id: new ObjectId(movieId) }, { $set: { num_mflix_comments: commentCount } })
    } catch (error) {
      console.error("Error updating comment count:", error)
    }
  }

  // Database Management Methods
  static async createIndexes(): Promise<void> {
    console.log("📊 Creating/updating database indexes...")

    try {
      const mongoAvailable = await isMongoAvailable()
      if (!mongoAvailable) {
        console.log("❌ MongoDB not available, skipping index creation")
        return
      }

      const db = await getDatabase()
      if (!db) {
        console.log("❌ Database connection failed, skipping index creation")
        return
      }

      // Movies collection indexes
      await db.collection("movies").createIndex({ title: "text", plot: "text", fullplot: "text" })
      await db.collection("movies").createIndex({ genres: 1 })
      await db.collection("movies").createIndex({ year: 1 })
      await db.collection("movies").createIndex({ "imdb.rating": -1 })
      await db.collection("movies").createIndex({ released: -1 })

      // Comments collection indexes
      await db.collection("comments").createIndex({ movie_id: 1 })
      await db.collection("comments").createIndex({ date: -1 })

      // Users collection indexes
      await db.collection("users").createIndex({ email: 1 }, { unique: true })

      // Theaters collection indexes
      await db.collection("theaters").createIndex({ "location.geo": "2dsphere" })

      // Watchlist collection indexes
      await db.collection("watchlist").createIndex({ user_id: 1 })
      await db.collection("watchlist").createIndex({ movie_id: 1 })
      await db.collection("watchlist").createIndex({ user_id: 1, movie_id: 1 }, { unique: true })
      await db.collection("watchlist").createIndex({ user_id: 1, status: 1 })
      await db.collection("watchlist").createIndex({ added_date: -1 })

      console.log("✅ All indexes created/updated successfully")
    } catch (error) {
      console.error("❌ Error creating indexes:", error)
    }
  }

  static async getCollectionStats(): Promise<any> {
    console.log("📊 Fetching collection statistics...")

    try {
      const mongoAvailable = await isMongoAvailable()
      if (!mongoAvailable) {
        return { error: "MongoDB not available" }
      }

      const db = await getDatabase()
      if (!db) {
        return { error: "Database connection failed" }
      }

      const collections = ["movies", "users", "comments", "theaters", "watchlist"]
      const stats = {}

      for (const collectionName of collections) {
        try {
          const count = await db.collection(collectionName).countDocuments()
          const indexes = await db.collection(collectionName).indexes()
          stats[collectionName] = {
            documentCount: count,
            indexCount: indexes.length,
            indexes: indexes.map((idx) => ({ name: idx.name, keys: idx.key })),
          }
        } catch (error) {
          stats[collectionName] = { error: error.message }
        }
      }

      return stats
    } catch (error) {
      console.error("❌ Error fetching collection stats:", error)
      return { error: error.message }
    }
  }
}

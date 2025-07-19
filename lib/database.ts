import { ObjectId } from "mongodb"

// Only import MongoDB in Node.js runtime
let getDatabase: any = null
let dummyMovies: any = []
let dummyComments: any = []
let dummyTheaters: any = []
let dummyUsers: any = []

function isEdgeRuntime() {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.CF_PAGES === "1" ||
    typeof window !== "undefined" ||
    !process.env.MONGODB_URI
  )
}

// Conditional imports based on runtime
if (!isEdgeRuntime) {
  // Node.js runtime - import MongoDB
  try {
    const mongoModule = require("./mongodb")
    getDatabase = mongoModule.getDatabase

    const dummyModule = require("./dummy-data")
    dummyMovies = dummyModule.dummyMovies
    dummyComments = dummyModule.dummyComments
    dummyTheaters = dummyModule.dummyTheaters
    dummyUsers = dummyModule.dummyUsers
  } catch (error) {
    console.log("📝 MongoDB not available, using dummy data")
  }
} else {
  // Edge Runtime - use dummy data only
  console.log("🌐 Edge Runtime detected - using dummy data")
}

// Types
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

export interface WatchlistItem {
  _id: string
  user_id: string
  movie_id: string
  added_date: Date
  status: "want_to_watch" | "watching" | "watched"
  rating?: number
  notes?: string
}

export interface MovieWithWatchlist extends Movie {
  isInWatchlist?: boolean
  watchlistStatus?: "want_to_watch" | "watching" | "watched"
  userRating?: number
}

// MongoDB document types
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

// Helper functions
async function isMongoAvailable(): Promise<boolean> {
  if (!isEdgeRuntime) {
    return false
  }

  if (!process.env.MONGODB_URI || !getDatabase) {
    return false
  }

  try {
    const db = await getDatabase()
    return !!db
  } catch (error) {
    return false
  }
}

function limitMovieData(movie: Movie, isAuthenticated: boolean): Movie {
  if (isAuthenticated) {
    return movie
  }

  return {
    ...movie,
    plot: movie.plot.substring(0, 100) + "...",
    fullplot: undefined,
    cast: movie.cast.slice(0, 2),
    directors: movie.directors.slice(0, 1),
  }
}

// Database service
export class DatabaseService {
  static async getMovies(
    limit = 20,
    skip = 0,
    isAuthenticated = false,
    userId?: string,
  ): Promise<MovieWithWatchlist[]> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        console.log("🎭 Using dummy data for movies")
        const movies = dummyMovies.slice(skip, skip + limit)
        return movies.map((movie: Movie) => limitMovieData(movie, isAuthenticated))
      }

      const db = await getDatabase()
      if (!db) {
        const movies = dummyMovies.slice(skip, skip + limit)
        return movies.map((movie: Movie) => limitMovieData(movie, isAuthenticated))
      }

      const actualLimit = isAuthenticated ? limit : Math.min(limit, 6)
      const movies = await db.collection<MongoMovie>("movies").find({}).skip(skip).limit(actualLimit).toArray()

      const moviesWithWatchlist = await Promise.all(
        movies.map(async (movie: MongoMovie): Promise<MovieWithWatchlist> => {
          const baseMovie = limitMovieData(
            {
              ...movie,
              _id: movie._id.toString(),
            },
            isAuthenticated,
          )

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
      console.error("❌ Error fetching movies:", error)
      const movies = dummyMovies.slice(skip, skip + limit)
      return movies.map((movie: Movie) => limitMovieData(movie, isAuthenticated))
    }
  }

  static async getMovieById(id: string, isAuthenticated = false, userId?: string): Promise<MovieWithWatchlist | null> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        const movie = dummyMovies.find((movie: Movie) => movie._id === id) || null
        return movie ? limitMovieData(movie, isAuthenticated) : null
      }

      const db = await getDatabase()
      if (!db) {
        const movie = dummyMovies.find((movie: Movie) => movie._id === id) || null
        return movie ? limitMovieData(movie, isAuthenticated) : null
      }

      const movie = await db.collection<MongoMovie>("movies").findOne({ _id: new ObjectId(id) })
      if (!movie) return null

      const baseMovie = limitMovieData(
        {
          ...movie,
          _id: movie._id.toString(),
        },
        isAuthenticated,
      )

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
      console.error("❌ Error fetching movie:", error)
      const movie = dummyMovies.find((movie: Movie) => movie._id === id) || null
      return movie ? limitMovieData(movie, isAuthenticated) : null
    }
  }

  static async searchMovies(query: string, isAuthenticated = false, userId?: string): Promise<MovieWithWatchlist[]> {
    if (!isAuthenticated) return []

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return dummyMovies.filter(
          (movie: Movie) =>
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.plot.toLowerCase().includes(query.toLowerCase()),
        )
      }

      const db = await getDatabase()
      if (!db) {
        return dummyMovies.filter(
          (movie: Movie) =>
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

      const moviesWithWatchlist = await Promise.all(
        movies.map(async (movie: MongoMovie): Promise<MovieWithWatchlist> => {
          const baseMovie = {
            ...movie,
            _id: movie._id.toString(),
          }

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
      console.error("❌ Error searching movies:", error)
      return dummyMovies.filter(
        (movie: Movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          movie.plot.toLowerCase().includes(query.toLowerCase()),
      )
    }
  }

  static async getMoviesByGenre(
    genre: string,
    isAuthenticated = false,
    userId?: string,
  ): Promise<MovieWithWatchlist[]> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        const movies = dummyMovies.filter((movie: Movie) => movie.genres.includes(genre))
        return movies.map((movie: Movie) => limitMovieData(movie, isAuthenticated))
      }

      const db = await getDatabase()
      if (!db) {
        const movies = dummyMovies.filter((movie: Movie) => movie.genres.includes(genre))
        return movies.map((movie: Movie) => limitMovieData(movie, isAuthenticated))
      }

      const limit = isAuthenticated ? 10 : 4
      const movies = await db
        .collection<MongoMovie>("movies")
        .find({ genres: { $in: [genre] } })
        .limit(limit)
        .toArray()

      const moviesWithWatchlist = await Promise.all(
        movies.map(async (movie: MongoMovie): Promise<MovieWithWatchlist> => {
          const baseMovie = limitMovieData(
            {
              ...movie,
              _id: movie._id.toString(),
            },
            isAuthenticated,
          )

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
      console.error("❌ Error fetching genre movies:", error)
      const movies = dummyMovies.filter((movie: Movie) => movie.genres.includes(genre))
      return movies.map((movie: Movie) => limitMovieData(movie, isAuthenticated))
    }
  }

  // Continue with other methods...
  static async getCommentsByMovieId(movieId: string, isAuthenticated = false): Promise<Comment[]> {
    if (!isAuthenticated) return []

    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return dummyComments.filter((comment: Comment) => comment.movie_id === movieId)
      }

      const db = await getDatabase()
      if (!db) {
        return dummyComments.filter((comment: Comment) => comment.movie_id === movieId)
      }

      const comments = await db
        .collection<MongoComment>("comments")
        .find({ movie_id: new ObjectId(movieId) })
        .sort({ date: -1 })
        .toArray()

      return comments.map(
        (comment: MongoComment): Comment => ({
          ...comment,
          _id: comment._id.toString(),
          movie_id: comment.movie_id.toString(),
        }),
      )
    } catch (error) {
      console.error("❌ Error fetching comments:", error)
      return dummyComments.filter((comment: Comment) => comment.movie_id === movieId)
    }
  }

  static async addComment(comment: Omit<Comment, "_id">): Promise<Comment> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        const newComment: Comment = {
          ...comment,
          _id: Date.now().toString(),
          date: new Date(),
        }
        dummyComments.push(newComment)
        return newComment
      }

      const db = await getDatabase()
      if (!db) {
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

      return {
        ...comment,
        _id: result.insertedId.toString(),
        date: new Date(),
      }
    } catch (error) {
      console.error("❌ Error adding comment:", error)
      const newComment: Comment = {
        ...comment,
        _id: Date.now().toString(),
        date: new Date(),
      }
      dummyComments.push(newComment)
      return newComment
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return dummyUsers.find((user: User) => user.email === email) || null
      }

      const db = await getDatabase()
      if (!db) return dummyUsers.find((user: User) => user.email === email) || null

      const user = await db.collection<MongoUser>("users").findOne({ email })
      if (!user) return null

      return {
        ...user,
        _id: user._id.toString(),
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      return dummyUsers.find((user: User) => user.email === email) || null
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

  // Watchlist methods
  static async addToWatchlist(
    userId: string,
    movieId: string,
    status: "want_to_watch" | "watching" | "watched" = "want_to_watch",
  ): Promise<WatchlistItem> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
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

      const existingItem = await db.collection<MongoWatchlistItem>("watchlist").findOne({
        user_id: new ObjectId(userId),
        movie_id: new ObjectId(movieId),
      })

      if (existingItem) {
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
        const result = await db.collection<Omit<MongoWatchlistItem, "_id">>("watchlist").insertOne({
          user_id: new ObjectId(userId),
          movie_id: new ObjectId(movieId),
          added_date: new Date(),
          status,
        })

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
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
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
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return dummyMovies.slice(0, 3).map((movie: Movie) => ({
          ...movie,
          isInWatchlist: true,
          watchlistStatus: status || "want_to_watch",
        }))
      }

      const db = await getDatabase()
      if (!db) return []

      const query: any = { user_id: new ObjectId(userId) }
      if (status) {
        query.status = status
      }

      const watchlistItems = await db
        .collection<MongoWatchlistItem>("watchlist")
        .find(query)
        .sort({ added_date: -1 })
        .toArray()

      const moviesWithWatchlist = await Promise.all(
        watchlistItems.map(async (item: MongoWatchlistItem): Promise<MovieWithWatchlist | null> => {
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

  static async getTheaters(): Promise<any[]> {
    try {
      const mongoAvailable = await isMongoAvailable()

      if (!mongoAvailable) {
        return dummyTheaters
      }

      const db = await getDatabase()
      if (!db) {
        return dummyTheaters
      }

      const theaters = await db.collection("theaters").find({}).toArray()
      return theaters.map((theater: any) => ({
        _id: theater._id.toString(),
        theaterId: theater.theaterId,
        location: theater.location,
      }))
    } catch (error) {
      console.error("❌ Error fetching theaters:", error)
      return dummyTheaters
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

  static async createIndexes(): Promise<void> {
    try {
      const mongoAvailable = await isMongoAvailable()
      if (!mongoAvailable) {
        return
      }

      const db = await getDatabase()
      if (!db) {
        return
      }

      await db.collection("movies").createIndex({ title: "text", plot: "text", fullplot: "text" })
      await db.collection("movies").createIndex({ genres: 1 })
      await db.collection("movies").createIndex({ year: 1 })
      await db.collection("movies").createIndex({ "imdb.rating": -1 })
      await db.collection("movies").createIndex({ released: -1 })

      await db.collection("comments").createIndex({ movie_id: 1 })
      await db.collection("comments").createIndex({ date: -1 })

      await db.collection("users").createIndex({ email: 1 }, { unique: true })

      await db.collection("theaters").createIndex({ "location.geo": "2dsphere" })

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
    try {
      const mongoAvailable = await isMongoAvailable()
      if (!mongoAvailable) {
        return {
          movies: dummyMovies.length,
          users: dummyUsers.length,
          comments: dummyComments.length,
          theaters: dummyTheaters.length,
          watchlist: 0,
        }
      }

      const db = await getDatabase()
      if (!db) {
        return {
          movies: dummyMovies.length,
          users: dummyUsers.length,
          comments: dummyComments.length,
          theaters: dummyTheaters.length,
          watchlist: 0,
        }
      }

      const collections = ["movies", "users", "comments", "theaters", "watchlist"]
      const stats: any = {}

      for (const collectionName of collections) {
        try {
          const count = await db.collection(collectionName).countDocuments()
          const indexes = await db.collection(collectionName).indexes()
          stats[collectionName] = {
            documentCount: count,
            indexCount: indexes.length,
            indexes: indexes.map((idx: any) => ({ name: idx.name, keys: idx.key })),
          }
        } catch (error) {
          stats[collectionName] = { error: (error as Error).message }
        }
      }

      return stats
    } catch (error) {
      console.error("❌ Error fetching collection stats:", error)
      return { error: (error as Error).message }
    }
  }
}

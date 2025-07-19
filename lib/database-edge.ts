// Edge Runtime compatible database service (dummy data only)
import { dummyMovies, dummyComments, dummyTheaters, dummyUsers } from "./dummy-data"

// Types (same as main database)
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

// Edge Runtime Database Service (Dummy Data Only)
export class EdgeDatabaseService {
  static async getMovies(
    limit = 20,
    skip = 0,
    isAuthenticated = false,
    userId?: string,
  ): Promise<MovieWithWatchlist[]> {
    console.log(`🎭 Edge Runtime: Using dummy data for movies`)
    const movies = dummyMovies.slice(skip, skip + limit)

    if (!isAuthenticated) {
      // Limit data for non-authenticated users
      return movies.slice(0, 6).map((movie) => ({
        ...movie,
        plot: movie.plot.substring(0, 100) + "...",
        cast: movie.cast.slice(0, 2),
        directors: movie.directors.slice(0, 1),
      }))
    }

    return movies.map((movie) => ({
      ...movie,
      isInWatchlist: Math.random() > 0.7,
      watchlistStatus: ["want_to_watch", "watching", "watched"][Math.floor(Math.random() * 3)] as any,
    }))
  }

  static async getMovieById(id: string, isAuthenticated = false, userId?: string): Promise<MovieWithWatchlist | null> {
    console.log(`🎭 Edge Runtime: Using dummy data for movie ${id}`)
    const movie = dummyMovies.find((m) => m._id === id)
    if (!movie) return null

    if (!isAuthenticated) {
      return {
        ...movie,
        plot: movie.plot.substring(0, 100) + "...",
        cast: movie.cast.slice(0, 2),
        directors: movie.directors.slice(0, 1),
      }
    }

    return {
      ...movie,
      isInWatchlist: Math.random() > 0.5,
      watchlistStatus: ["want_to_watch", "watching", "watched"][Math.floor(Math.random() * 3)] as any,
    }
  }

  static async searchMovies(query: string, isAuthenticated = false): Promise<MovieWithWatchlist[]> {
    if (!isAuthenticated) return []

    return dummyMovies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.plot.toLowerCase().includes(query.toLowerCase()),
    )
  }

  static async getMoviesByGenre(genre: string, isAuthenticated = false): Promise<MovieWithWatchlist[]> {
    const movies = dummyMovies.filter((movie) => movie.genres.includes(genre))
    return isAuthenticated ? movies : movies.slice(0, 4)
  }

  static async getCommentsByMovieId(movieId: string, isAuthenticated = false): Promise<Comment[]> {
    if (!isAuthenticated) return []
    return dummyComments.filter((comment) => comment.movie_id === movieId)
  }

  static async addComment(comment: Omit<Comment, "_id">): Promise<Comment> {
    const newComment: Comment = {
      ...comment,
      _id: Date.now().toString(),
      date: new Date(),
    }
    dummyComments.push(newComment)
    return newComment
  }

  static async getTheaters(): Promise<Theater[]> {
    return dummyTheaters
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return dummyUsers.find((user) => user.email === email) || null
  }

  static async createUser(userData: Omit<User, "_id">): Promise<User> {
    const newUser: User = {
      ...userData,
      _id: Date.now().toString(),
    }
    dummyUsers.push(newUser)
    return newUser
  }

  static async addToWatchlist(
    userId: string,
    movieId: string,
    status: "want_to_watch" | "watching" | "watched" = "want_to_watch",
  ): Promise<WatchlistItem> {
    return {
      _id: Date.now().toString(),
      user_id: userId,
      movie_id: movieId,
      added_date: new Date(),
      status,
    }
  }

  static async removeFromWatchlist(userId: string, movieId: string): Promise<boolean> {
    return true
  }

  static async getUserWatchlist(
    userId: string,
    status?: "want_to_watch" | "watching" | "watched",
  ): Promise<MovieWithWatchlist[]> {
    return dummyMovies.slice(0, 3).map((movie) => ({
      ...movie,
      isInWatchlist: true,
      watchlistStatus: status || "want_to_watch",
    }))
  }

  static async updateWatchlistItem(userId: string, movieId: string, updates: any): Promise<boolean> {
    return true
  }

  static async getCollectionStats(): Promise<any> {
    return {
      movies: dummyMovies.length,
      users: dummyUsers.length,
      comments: dummyComments.length,
      theaters: dummyTheaters.length,
      watchlist: 0,
    }
  }

  static async createIndexes(): Promise<void> {
    console.log("🎭 Edge Runtime: Skipping index creation")
  }

  static async updateMovieCommentCount(movieId: string): Promise<void> {
    console.log("🎭 Edge Runtime: Skipping comment count update")
  }
}

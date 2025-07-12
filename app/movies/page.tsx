export const runtime = "edge";
import { DatabaseService } from "@/lib/database"
import { MovieGrid } from "@/components/organisms/movie-grid"
import { isAuthenticated, getServerUser } from "@/lib/auth-server"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Film, Lock } from "lucide-react"

async function UnauthenticatedMoviesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Lock className="h-8 w-8 text-red-400" />
                <Film className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-4">Sign in to Browse Movies</CardTitle>
              <CardDescription className="text-gray-300 mb-6 text-lg">
                Access our full collection of movies, create watchlists, and enjoy unlimited streaming.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

async function AuthenticatedMoviesPage() {
  const user = await getServerUser()
  const movies = await DatabaseService.getMovies(50, 0, true, user?.id)

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">All Movies</h1>
          <p className="text-gray-400">Discover your next favorite movie</p>
        </div>

        <MovieGrid movies={movies} />
      </div>
    </div>
  )
}

export default async function MoviesPage() {
  const userAuthenticated = await isAuthenticated()

  if (userAuthenticated) {
    return <AuthenticatedMoviesPage />
  } else {
    return <UnauthenticatedMoviesPage />
  }
}

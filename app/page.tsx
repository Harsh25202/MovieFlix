export const runtime = "edge";
import { Suspense } from "react"
import { DatabaseService } from "@/lib/database"
import { MovieGrid } from "@/components/organisms/movie-grid"
import { MovieHero } from "@/components/organisms/movie-hero"
import { HeroSkeleton } from "@/components/molecules/hero-skeleton"
import { MovieGridSkeleton } from "@/components/molecules/movie-grid-skeleton"
import { isAuthenticated, getServerUser } from "@/lib/auth-server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, Star, Users, Film } from "lucide-react"

async function UnauthenticatedHome() {
  const movies = await DatabaseService.getMovies(6, 0, false)
  const featuredMovie = movies[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-screen flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{
              backgroundImage: `url(${featuredMovie.poster})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              MovieFlix
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Unlimited movies, TV shows and more. Watch anywhere. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg" asChild>
                <Link href="/signup">
                  <Play className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg bg-transparent"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Why Choose MovieFlix?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <Film className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-white">Unlimited Movies</CardTitle>
                <CardDescription className="text-gray-400">Access thousands of movies from every genre</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <Star className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-white">Premium Quality</CardTitle>
                <CardDescription className="text-gray-400">Watch in HD and 4K with crystal clear audio</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <Users className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle className="text-white">Multiple Profiles</CardTitle>
                <CardDescription className="text-gray-400">
                  Create profiles for different family members
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Limited Preview */}
      <div className="py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">Preview Our Collection</h2>
          <p className="text-center text-gray-400 mb-12">Sign up to see our full library of movies and shows</p>

          <Suspense fallback={<MovieGridSkeleton count={6} />}>
            <MovieGrid movies={movies} />
          </Suspense>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to watch?</h3>
              <p className="text-white/90 mb-6">Join millions of users streaming their favorite content</p>
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                asChild
              >
                <Link href="/signup">Start Your Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function AuthenticatedHome() {
  const user = await getServerUser()
  const movies = await DatabaseService.getMovies(20, 0, true, user?.id)
  const featuredMovie = movies[0]

  return (
    <div className="space-y-12 bg-black min-h-screen">
      <Suspense fallback={<HeroSkeleton />}>{featuredMovie && <MovieHero movie={featuredMovie} />}</Suspense>

      <div className="container mx-auto px-4 space-y-12">
        <Suspense fallback={<MovieGridSkeleton title="Popular Movies" />}>
          <MovieGrid movies={movies} title="Popular Movies" />
        </Suspense>

        <Suspense fallback={<MovieGridSkeleton title="Action Movies" />}>
          <MovieGrid movies={await DatabaseService.getMoviesByGenre("Action", true, user?.id)} title="Action Movies" />
        </Suspense>

        <Suspense fallback={<MovieGridSkeleton title="Drama Movies" />}>
          <MovieGrid movies={await DatabaseService.getMoviesByGenre("Drama", true, user?.id)} title="Drama Movies" />
        </Suspense>

        <Suspense fallback={<MovieGridSkeleton title="Comedy Movies" />}>
          <MovieGrid movies={await DatabaseService.getMoviesByGenre("Comedy", true, user?.id)} title="Comedy Movies" />
        </Suspense>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const userAuthenticated = await isAuthenticated()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      }
    >
      {userAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />}
    </Suspense>
  )
}

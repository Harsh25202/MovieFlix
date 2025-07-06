import { notFound } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { MoviePoster } from "@/components/atoms/movie-poster"
import { MovieRating } from "@/components/atoms/movie-rating"
import { GenreBadge } from "@/components/atoms/genre-badge"
import { CommentsSection } from "@/components/organisms/comments-section"
import { WatchlistButton } from "@/components/atoms/watchlist-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getServerUser } from "@/lib/auth-server"
import Link from "next/link"
import { Lock, Play, Info } from "lucide-react"

interface MoviePageProps {
  params: Promise<{
    id: string
  }>
}

async function UnauthenticatedMovieView({ movie }: { movie: any }) {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MoviePoster
              src={movie.poster}
              alt={movie.title}
              width={400}
              height={600}
              className="w-full max-w-md mx-auto"
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <MovieRating rating={movie.imdb.rating} votes={movie.imdb.votes} />
                <span className="text-gray-400">{movie.year}</span>
                <span className="text-gray-400">{movie.runtime} min</span>
                {movie.rated && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">{movie.rated}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <GenreBadge key={genre} genre={genre} />
                ))}
              </div>

              <p className="text-lg leading-relaxed mb-6 text-gray-300">{movie.plot}</p>

              {/* Limited Info Notice */}
              <Card className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-6 w-6 text-red-400" />
                    <h3 className="text-xl font-semibold text-white">Sign up to see more</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Get full access to movie details, cast information, reviews, and much more.
                  </p>
                  <div className="flex gap-3">
                    <Button className="bg-red-600 hover:bg-red-700" asChild>
                      <Link href="/signup">Sign Up Free</Link>
                    </Button>
                    <Button
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
      </div>
    </div>
  )
}

async function AuthenticatedMovieView({ movie, comments }: { movie: any; comments: any[] }) {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MoviePoster
              src={movie.poster}
              alt={movie.title}
              width={400}
              height={600}
              className="w-full max-w-md mx-auto"
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-white">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <MovieRating rating={movie.imdb.rating} votes={movie.imdb.votes} />
                <span className="text-gray-400">{movie.year}</span>
                <span className="text-gray-400">{movie.runtime} min</span>
                {movie.rated && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">{movie.rated}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <GenreBadge key={genre} genre={genre} />
                ))}
              </div>

              <p className="text-lg leading-relaxed mb-6 text-gray-300">{movie.fullplot || movie.plot}</p>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 gap-2">
                  <Play className="h-5 w-5" />
                  Play
                </Button>

                <WatchlistButton
                  movieId={movie._id}
                  isInWatchlist={movie.isInWatchlist}
                  currentStatus={movie.watchlistStatus}
                  size="lg"
                />

                <Button size="lg" variant="ghost" className="text-gray-300 hover:bg-gray-800 gap-2">
                  <Info className="h-5 w-5" />
                  More Info
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Cast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {movie.cast.map((actor) => (
                      <li key={actor} className="text-sm text-gray-300">
                        {actor}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium text-white">Directors: </span>
                    <span className="text-sm text-gray-300">{movie.directors.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-white">Countries: </span>
                    <span className="text-sm text-gray-300">{movie.countries.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-white">Languages: </span>
                    <span className="text-sm text-gray-300">{movie.languages.join(", ")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <CommentsSection movieId={movie._id} initialComments={comments} />
        </div>
      </div>
    </div>
  )
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params
  const userAuthenticated = await isAuthenticated()
  const user = await getServerUser()

  const movie = await DatabaseService.getMovieById(id, userAuthenticated, user?.id)

  if (!movie) {
    notFound()
  }

  const comments = await DatabaseService.getCommentsByMovieId(id, userAuthenticated)

  if (userAuthenticated) {
    return <AuthenticatedMovieView movie={movie} comments={comments} />
  } else {
    return <UnauthenticatedMovieView movie={movie} />
  }
}

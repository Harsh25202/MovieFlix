import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MoviePoster } from "@/components/atoms/movie-poster"
import { MovieRating } from "@/components/atoms/movie-rating"
import { GenreBadge } from "@/components/atoms/genre-badge"
import { WatchlistButton } from "@/components/atoms/watchlist-button"
import type { MovieWithWatchlist } from "@/lib/database"

interface MovieCardProps {
  movie: MovieWithWatchlist
  showWatchlistButton?: boolean
}

export function MovieCard({ movie, showWatchlistButton = true }: MovieCardProps) {
  return (
    <Card className="group cursor-pointer transition-all hover:shadow-lg bg-gray-900 border-gray-800 movie-card">
      <CardContent className="p-0">
        <Link href={`/movies/${movie._id}`}>
          <MoviePoster src={movie.poster} alt={movie.title} width={250} height={375} className="w-full" />
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <Link href={`/movies/${movie._id}`} className="w-full">
          <h3 className="font-semibold line-clamp-1 group-hover:text-red-400 text-white transition-colors">
            {movie.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((genre) => (
            <GenreBadge key={genre} genre={genre} />
          ))}
        </div>

        <MovieRating rating={movie.imdb.rating} />

        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-gray-400">
            {movie.year} • {movie.runtime} min
          </p>

          {movie.isInWatchlist && <div className="text-xs text-green-400 font-medium">✓ In List</div>}
        </div>

        {showWatchlistButton && (
          <WatchlistButton
            movieId={movie._id}
            isInWatchlist={movie.isInWatchlist}
            currentStatus={movie.watchlistStatus}
            size="sm"
            variant="outline"
          />
        )}
      </CardFooter>
    </Card>
  )
}

import { Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieRating } from "@/components/atoms/movie-rating"
import { GenreBadge } from "@/components/atoms/genre-badge"
import type { Movie } from "@/lib/database"
import Link from "next/link"
import { WatchlistButton } from "@/components/atoms/watchlist-button"

interface MovieHeroProps {
  movie: Movie
}

export function MovieHero({ movie }: MovieHeroProps) {
  return (
    <div className="relative min-h-[70vh] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%), url(${movie.poster})`,
        }}
      />
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white">{movie.title}</h1>

          <div className="flex flex-wrap items-center gap-4">
            <MovieRating rating={movie.imdb.rating} votes={movie.imdb.votes} />
            <span className="text-white">{movie.year}</span>
            <span className="text-white">{movie.runtime} min</span>
            {movie.rated && <span className="px-2 py-1 bg-gray-600 text-white text-sm rounded">{movie.rated}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <GenreBadge key={genre} genre={genre} />
            ))}
          </div>

          <p className="text-lg text-gray-200 leading-relaxed">{movie.fullplot || movie.plot}</p>

          <div className="flex gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href={`/movies/${movie._id}`}>
                <Play className="h-5 w-5" />
                Play
              </Link>
            </Button>
            <WatchlistButton
              movieId={movie._id}
              isInWatchlist={movie.isInWatchlist}
              currentStatus={movie.watchlistStatus}
              size="lg"
              variant="outline"
            />
            <Button size="lg" variant="ghost" className="gap-2" asChild>
              <Link href={`/movies/${movie._id}`}>
                <Info className="h-5 w-5" />
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

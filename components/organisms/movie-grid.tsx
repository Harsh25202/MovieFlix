import { MovieCard } from "@/components/molecules/movie-card"
import { MovieGridSkeleton } from "@/components/molecules/movie-grid-skeleton"
import type { Movie } from "@/lib/database"
import { Suspense } from "react"

interface MovieGridProps {
  movies: Movie[]
  title?: string
  showWatchlistButton?: boolean
  loading?: boolean
}

export function MovieGrid({ movies, title, showWatchlistButton = true, loading = false }: MovieGridProps) {
  if (loading) {
    return <MovieGridSkeleton title={title} />
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No movies found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <Suspense key={movie._id} fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg" />}>
            <MovieCard movie={movie} showWatchlistButton={showWatchlistButton} />
          </Suspense>
        ))}
      </div>
    </div>
  )
}

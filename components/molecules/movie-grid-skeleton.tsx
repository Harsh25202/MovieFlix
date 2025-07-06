import { MovieCardSkeleton } from "./movie-card-skeleton"

interface MovieGridSkeletonProps {
  count?: number
  title?: string
}

export function MovieGridSkeleton({ count = 10, title }: MovieGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {title && <div className="h-8 bg-gray-800 rounded w-64 animate-pulse" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

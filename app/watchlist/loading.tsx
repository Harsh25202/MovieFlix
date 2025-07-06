import { Skeleton } from "@/components/atoms/skeleton"
import { MovieGridSkeleton } from "@/components/molecules/movie-grid-skeleton"

export default function WatchlistLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Tabs Skeleton */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-4 gap-2 bg-gray-900 p-1 rounded-lg">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>

        <MovieGridSkeleton count={12} />
      </div>
    </div>
  )
}

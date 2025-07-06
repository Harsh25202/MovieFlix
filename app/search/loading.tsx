import { Skeleton } from "@/components/atoms/skeleton"
import { MovieGridSkeleton } from "@/components/molecules/movie-grid-skeleton"

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      <MovieGridSkeleton title="Search Results" />
    </div>
  )
}

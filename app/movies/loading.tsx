import { MovieGridSkeleton } from "@/components/molecules/movie-grid-skeleton"

export default function MoviesLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-800 rounded w-48 animate-pulse mb-8" />
        <MovieGridSkeleton count={20} />
      </div>
    </div>
  )
}

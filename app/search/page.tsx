import { Suspense } from "react"
import { DatabaseService } from "@/lib/database"
import { SearchBar } from "@/components/molecules/search-bar"
import { MovieGrid } from "@/components/organisms/movie-grid"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Enter a search term to find movies.</p>
      </div>
    )
  }

  const movies = await DatabaseService.searchMovies(query)

  return <MovieGrid movies={movies} title={`Search results for "${query}"`} />
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded w-64 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = "" } = await searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Search Movies</h1>
        <SearchBar initialQuery={query} />
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  )
}

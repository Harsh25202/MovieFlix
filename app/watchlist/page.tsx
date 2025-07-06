"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { MovieGrid } from "@/components/organisms/movie-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Loader2, Heart, Eye, Check, Plus } from "lucide-react"
import type { MovieWithWatchlist } from "@/lib/database"

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth()
  const [watchlist, setWatchlist] = useState<MovieWithWatchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchWatchlist()
    }
  }, [user, activeTab])

  const fetchWatchlist = async () => {
    setLoading(true)
    try {
      const status = activeTab === "all" ? "" : activeTab
      const response = await fetch(`/api/watchlist${status ? `?status=${status}` : ""}`)

      if (response.ok) {
        const data = await response.json()
        setWatchlist(data.watchlist)
      } else {
        console.error("Failed to fetch watchlist")
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredWatchlist = (status?: string) => {
    if (!status || status === "all") return watchlist
    return watchlist.filter((movie) => movie.watchlistStatus === status)
  }

  const getStatusCount = (status: string) => {
    if (status === "all") return watchlist.length
    return watchlist.filter((movie) => movie.watchlistStatus === status).length
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">Keep track of movies you want to watch, are watching, or have watched</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
            >
              <Heart className="mr-2 h-4 w-4" />
              All
              <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
                {getStatusCount("all")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="want_to_watch"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              Want to Watch
              <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
                {getStatusCount("want_to_watch")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="watching"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
            >
              <Eye className="mr-2 h-4 w-4" />
              Watching
              <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
                {getStatusCount("watching")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="watched"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400"
            >
              <Check className="mr-2 h-4 w-4" />
              Watched
              <Badge variant="secondary" className="ml-2 bg-gray-700 text-gray-300">
                {getStatusCount("watched")}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : (
              <>
                <TabsContent value="all">
                  {watchlist.length === 0 ? (
                    <EmptyWatchlistCard />
                  ) : (
                    <MovieGrid movies={watchlist} showWatchlistButton={false} />
                  )}
                </TabsContent>

                <TabsContent value="want_to_watch">
                  {getFilteredWatchlist("want_to_watch").length === 0 ? (
                    <EmptyStateCard
                      title="No movies in your want to watch list"
                      description="Add movies you're planning to watch"
                    />
                  ) : (
                    <MovieGrid movies={getFilteredWatchlist("want_to_watch")} showWatchlistButton={false} />
                  )}
                </TabsContent>

                <TabsContent value="watching">
                  {getFilteredWatchlist("watching").length === 0 ? (
                    <EmptyStateCard
                      title="No movies you're currently watching"
                      description="Mark movies as watching when you start them"
                    />
                  ) : (
                    <MovieGrid movies={getFilteredWatchlist("watching")} showWatchlistButton={false} />
                  )}
                </TabsContent>

                <TabsContent value="watched">
                  {getFilteredWatchlist("watched").length === 0 ? (
                    <EmptyStateCard
                      title="No watched movies yet"
                      description="Mark movies as watched after you finish them"
                    />
                  ) : (
                    <MovieGrid movies={getFilteredWatchlist("watched")} showWatchlistButton={false} />
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}

function EmptyWatchlistCard() {
  const router = useRouter()

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Your watchlist is empty
        </CardTitle>
        <CardDescription className="text-gray-400">
          Start building your personal movie collection by adding movies to your watchlist
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700">
            Browse Movies
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/search")}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            Search Movies
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyStateCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="text-center py-12">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

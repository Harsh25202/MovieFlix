export const runtime = "edge";
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Loader2, Database, RefreshCw, BarChart3, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CollectionStat {
  documentCount: number
  indexCount: number
  indexes: Array<{ name: string; keys: any }>
  error?: string
}

interface DatabaseStats {
  [key: string]: CollectionStat
}

export default function DatabaseAdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DatabaseStats>({})
  const [loading, setLoading] = useState(true)
  const [indexing, setIndexing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/database?action=stats")

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        setMessage({ type: "error", text: "Failed to fetch database stats" })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setMessage({ type: "error", text: "Error fetching database stats" })
    } finally {
      setLoading(false)
    }
  }

  const createIndexes = async () => {
    setIndexing(true)
    setMessage(null)
    try {
      const response = await fetch("/api/admin/database?action=indexes")

      if (response.ok) {
        setMessage({ type: "success", text: "Indexes created/updated successfully" })
        await fetchStats() // Refresh stats
      } else {
        setMessage({ type: "error", text: "Failed to create indexes" })
      }
    } catch (error) {
      console.error("Error creating indexes:", error)
      setMessage({ type: "error", text: "Error creating indexes" })
    } finally {
      setIndexing(false)
    }
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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="h-8 w-8 text-red-500" />
            Database Administration
          </h1>
          <p className="text-gray-400">Manage your MongoDB collections and indexes</p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}
          >
            <AlertDescription className={message.type === "error" ? "text-red-400" : "text-green-400"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchStats} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh Stats
              </Button>

              <Button onClick={createIndexes} disabled={indexing} className="w-full bg-green-600 hover:bg-green-700">
                {indexing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                Create/Update Indexes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Database Overview</CardTitle>
              <CardDescription className="text-gray-400">Total collections and documents</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Collections:</span>
                    <span className="text-white font-semibold">{Object.keys(stats).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Documents:</span>
                    <span className="text-white font-semibold">
                      {Object.values(stats).reduce((total, stat) => total + (stat.documentCount || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Indexes:</span>
                    <span className="text-white font-semibold">
                      {Object.values(stats).reduce((total, stat) => total + (stat.indexCount || 0), 0)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Collection Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Collection Statistics</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(stats).map(([collectionName, stat]) => (
                <Card key={collectionName} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white capitalize flex items-center justify-between">
                      {collectionName}
                      <Badge variant="secondary" className="bg-red-600 text-white">
                        {stat.documentCount || 0} docs
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stat.error ? (
                      <div className="text-red-400 text-sm">{stat.error}</div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Documents:</span>
                          <span className="text-white font-semibold">{stat.documentCount}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Indexes:</span>
                          <span className="text-white font-semibold">{stat.indexCount}</span>
                        </div>

                        {stat.indexes && stat.indexes.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Index Details:</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {stat.indexes.map((index, i) => (
                                <div key={i} className="text-xs bg-gray-800 p-2 rounded">
                                  <div className="text-gray-300 font-medium">{index.name}</div>
                                  <div className="text-gray-500">{JSON.stringify(index.keys)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Indexes */}
        <Card className="mt-8 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recommended Indexes</CardTitle>
            <CardDescription className="text-gray-400">
              These indexes are automatically created to optimize query performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-white mb-2">Movies Collection:</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• Text search on title, plot, fullplot</li>
                  <li>• Genres array index</li>
                  <li>• Year index</li>
                  <li>• IMDB rating descending</li>
                  <li>• Release date descending</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Watchlist Collection:</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• User ID index</li>
                  <li>• Movie ID index</li>
                  <li>• Compound user_id + movie_id (unique)</li>
                  <li>• User ID + status compound</li>
                  <li>• Added date descending</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Comments Collection:</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• Movie ID index</li>
                  <li>• Date descending</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Other Collections:</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• Users: email unique index</li>
                  <li>• Theaters: 2dsphere geo index</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

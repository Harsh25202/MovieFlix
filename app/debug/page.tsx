export const runtime = "edge";
import { DatabaseService } from "@/lib/database"
import { getDatabase } from "@/lib/mongodb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DebugPage() {
  // Test MongoDB connection
  let mongoStatus = "disconnected"
  let mongoError = null
  let collections = []
  let connectionDetails = {}

  try {
    const db = await getDatabase()
    if (db) {
      await db.admin().ping()
      mongoStatus = "connected"
      collections = await db.listCollections().toArray()

      // Get some stats
      const movieCount = await db.collection("movies").countDocuments()
      const commentCount = await db.collection("comments").countDocuments()
      const theaterCount = await db.collection("theaters").countDocuments()

      connectionDetails = {
        movieCount,
        commentCount,
        theaterCount,
        collections: collections.length,
      }
    } else {
      mongoStatus = "not configured"
    }
  } catch (error) {
    mongoStatus = "error"
    mongoError = error.message
  }

  // Get sample data to see source
  const movies = await DatabaseService.getMovies(3)
  const theaters = await DatabaseService.getTheaters()
  const comments = movies.length > 0 ? await DatabaseService.getCommentsByMovieId(movies[0]._id) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Data Source Debug</h1>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Button asChild>
          <Link href="/api/env-check">Check Environment Variables</Link>
        </Button>
        <Button asChild>
          <Link href="/api/test-mongo">Test MongoDB Connection</Link>
        </Button>
        <Button asChild>
          <Link href="/api/health">Health Check</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* MongoDB Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗄️ MongoDB Status
              <Badge variant={mongoStatus === "connected" ? "default" : "destructive"}>{mongoStatus}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>URI Configured:</strong> {process.env.MONGODB_URI ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Database Name:</strong> {process.env.MONGODB_DB_NAME || "movieflix"}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV || "development"}
            </div>
            {mongoError && (
              <div className="text-red-600">
                <strong>Error:</strong> {mongoError}
              </div>
            )}
            {mongoStatus === "connected" && (
              <div className="space-y-1">
                <div>
                  <strong>Movies:</strong> {connectionDetails.movieCount}
                </div>
                <div>
                  <strong>Comments:</strong> {connectionDetails.commentCount}
                </div>
                <div>
                  <strong>Theaters:</strong> {connectionDetails.theaterCount}
                </div>
                <div>
                  <strong>Collections:</strong> {connectionDetails.collections}
                </div>
              </div>
            )}
            {collections.length > 0 && (
              <div>
                <strong>Collections:</strong>
                <ul className="list-disc list-inside ml-4">
                  {collections.map((col) => (
                    <li key={col.name}>{col.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Summary */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Data Source Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Movies Source:</strong>{" "}
              <Badge variant={mongoStatus === "connected" ? "default" : "secondary"}>
                {mongoStatus === "connected" ? "MongoDB Atlas" : "Dummy Data"}
              </Badge>
            </div>
            <div>
              <strong>Theaters Source:</strong>{" "}
              <Badge variant={mongoStatus === "connected" ? "default" : "secondary"}>
                {mongoStatus === "connected" ? "MongoDB Atlas" : "Dummy Data"}
              </Badge>
            </div>
            <div>
              <strong>Comments Source:</strong>{" "}
              <Badge variant={mongoStatus === "connected" ? "default" : "secondary"}>
                {mongoStatus === "connected" ? "MongoDB Atlas" : "Dummy Data"}
              </Badge>
            </div>
            <div className="mt-4 p-3 bg-muted rounded">
              {mongoStatus === "connected" ? (
                <span className="text-green-600">✅ All data is coming from your MongoDB Atlas database</span>
              ) : (
                <span className="text-orange-600">⚠️ Using dummy data as fallback (MongoDB not available)</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔧 Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>MONGODB_URI:</strong>{" "}
              {process.env.MONGODB_URI
                ? `Set (${process.env.MONGODB_URI.length} chars, starts with: ${process.env.MONGODB_URI.substring(0, 20)}...)`
                : "❌ NOT SET - This is the problem!"}
            </div>
            <div>
              <strong>MONGODB_DB_NAME:</strong> {process.env.MONGODB_DB_NAME || "❌ Not set"}
            </div>
            <div>
              <strong>JWT_SECRET:</strong>{" "}
              {process.env.JWT_SECRET ? `Set (${process.env.JWT_SECRET.length} chars)` : "❌ Not set"}
            </div>
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV || "❌ Not set"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔧 Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!process.env.MONGODB_URI && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-bold text-red-800">❌ MONGODB_URI Not Set</h3>
              <p className="text-red-700">
                This is why your app is using dummy data. The environment variable is not configured.
              </p>
              <div className="mt-3">
                <strong>For Vercel:</strong>
                <ol className="list-decimal list-inside ml-4 mt-1">
                  <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                  <li>
                    Add: <code className="bg-red-100 px-1 rounded">MONGODB_URI</code>
                  </li>
                  <li>
                    Value:{" "}
                    <code className="bg-red-100 px-1 rounded">
                      mongodb+srv://hspa4132:Hsp@4132@cluster0.ixqhj.mongodb.net/movieflix
                    </code>
                  </li>
                  <li>Redeploy your application</li>
                </ol>
              </div>
            </div>
          )}

          {process.env.MONGODB_URI && mongoStatus !== "connected" && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <h3 className="font-bold text-orange-800">⚠️ MongoDB Connection Failed</h3>
              <p className="text-orange-700">Environment variable is set but connection failed: {mongoError}</p>
              <div className="mt-3">
                <strong>Check:</strong>
                <ol className="list-decimal list-inside ml-4 mt-1">
                  <li>MongoDB Atlas cluster is running</li>
                  <li>IP whitelist includes 0.0.0.0/0</li>
                  <li>Username/password are correct</li>
                  <li>Network connectivity</li>
                </ol>
              </div>
            </div>
          )}

          {mongoStatus === "connected" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-bold text-green-800">✅ MongoDB Connected Successfully</h3>
              <p className="text-green-700">Your app is successfully using MongoDB Atlas for all data operations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Data Preview */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎬 Sample Movies ({movies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {movies.map((movie) => (
                <div key={movie._id} className="p-3 border rounded">
                  <div className="font-medium">
                    {movie.title} ({movie.year})
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {movie._id}</div>
                  <div className="text-sm text-muted-foreground">Genres: {movie.genres.join(", ")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

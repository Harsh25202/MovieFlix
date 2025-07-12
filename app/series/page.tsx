export const runtime = "edge";
import { isAuthenticated } from "@/lib/auth-server"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tv, Lock, Play } from "lucide-react"

async function UnauthenticatedSeriesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/30">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Lock className="h-8 w-8 text-red-400" />
                <Tv className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-4">Sign in to Watch TV Shows</CardTitle>
              <CardDescription className="text-gray-300 mb-6 text-lg">
                Access our full collection of TV series, documentaries, and exclusive content.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

async function AuthenticatedSeriesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TV Shows & Series</h1>
          <p className="text-gray-400">Coming soon - Our TV shows collection is being prepared</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards for upcoming TV shows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg mb-4">
                  <Tv className="h-12 w-12 text-gray-600" />
                </div>
                <h3 className="text-white font-semibold mb-2">Coming Soon</h3>
                <p className="text-gray-400 text-sm">TV shows and series will be available soon</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Play className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">TV Shows Coming Soon</h3>
              <p className="text-gray-300 mb-6">
                We're working hard to bring you the best TV shows and series. Stay tuned for updates!
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/">Browse Movies Instead</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function SeriesPage() {
  const userAuthenticated = await isAuthenticated()

  if (userAuthenticated) {
    return <AuthenticatedSeriesPage />
  } else {
    return <UnauthenticatedSeriesPage />
  }
}

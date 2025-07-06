import { DatabaseService } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default async function TheatersPage() {
  const theaters = await DatabaseService.getTheaters()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Theaters</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <Card key={theater._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Theater #{theater.theaterId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{theater.location.address.street1}</p>
                <p className="text-sm text-muted-foreground">
                  {theater.location.address.city}, {theater.location.address.state} {theater.location.address.zipcode}
                </p>
                <p className="text-xs text-muted-foreground">
                  Coordinates: {theater.location.geo.coordinates[1]}, {theater.location.geo.coordinates[0]}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

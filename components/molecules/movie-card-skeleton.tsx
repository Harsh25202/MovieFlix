import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/atoms/skeleton"

export function MovieCardSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-0">
        <Skeleton className="aspect-[2/3] w-full rounded-t-lg" />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16 ml-2" />
        </div>
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  )
}

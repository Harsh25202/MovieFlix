import { Skeleton } from "@/components/atoms/skeleton"

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[70vh] flex items-center bg-gray-900">
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-16 w-96" />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>

          <Skeleton className="h-24 w-full" />

          <div className="flex gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

import { Star } from "lucide-react"

interface MovieRatingProps {
  rating: number
  votes?: number
  className?: string
}

export function MovieRating({ rating, votes, className = "" }: MovieRatingProps) {
  const stars = Math.round(rating / 2) // Convert 10-point scale to 5-star

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating}/10 {votes && `(${votes.toLocaleString()} votes)`}
      </span>
    </div>
  )
}

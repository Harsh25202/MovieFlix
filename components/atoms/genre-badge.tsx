import { Badge } from "@/components/ui/badge"

interface GenreBadgeProps {
  genre: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function GenreBadge({ genre, variant = "secondary" }: GenreBadgeProps) {
  return (
    <Badge variant={variant} className="text-xs">
      {genre}
    </Badge>
  )
}

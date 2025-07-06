import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Comment } from "@/lib/database"

interface CommentCardProps {
  comment: Comment
}

export function CommentCard({ comment }: CommentCardProps) {
  const initials = comment.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{comment.name}</p>
          <p className="text-sm text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{comment.text}</p>
      </CardContent>
    </Card>
  )
}

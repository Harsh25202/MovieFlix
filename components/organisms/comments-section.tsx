"use client"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommentCard } from "@/components/molecules/comment-card"
import { addCommentAction } from "@/app/actions/comments"
import { useAuth } from "@/lib/auth-context"
import type { Comment } from "@/lib/database"

interface CommentsSectionProps {
  movieId: string
  initialComments: Comment[]
}

export function CommentsSection({ movieId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { user } = useAuth()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await addCommentAction(formData)

      if (result.success) {
        setSuccess("Comment added successfully!")
        // Add the new comment to the local state
        if (result.comment) {
          setComments([result.comment, ...comments])
        }
        // Reset form
        const form = document.getElementById("comment-form") as HTMLFormElement
        if (form) {
          form.reset()
        }
      } else {
        setError(result.error || "Failed to add comment")
      }
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Comments ({comments.length})</h3>

      <Card>
        <CardHeader>
          <CardTitle>Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="comment-form" action={handleSubmit} className="space-y-4">
            <input type="hidden" name="movieId" value={movieId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="name"
                placeholder="Your name"
                required
                disabled={isPending}
                defaultValue={user?.name || ""}
              />
              <Input
                name="email"
                type="email"
                placeholder="Your email"
                required
                disabled={isPending}
                defaultValue={user?.email || ""}
              />
            </div>

            <Textarea name="text" placeholder="Write your comment..." rows={4} required disabled={isPending} />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {success && <div className="text-green-600 text-sm">{success}</div>}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  )
}

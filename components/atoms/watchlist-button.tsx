"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface WatchlistButtonProps {
  movieId: string
  isInWatchlist?: boolean
  currentStatus?: "want_to_watch" | "watching" | "watched"
  onStatusChange?: (status: "want_to_watch" | "watching" | "watched" | null) => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const statusLabels = {
  want_to_watch: "Want to Watch",
  watching: "Watching",
  watched: "Watched",
}

const statusIcons = {
  want_to_watch: Plus,
  watching: Loader2,
  watched: Check,
}

export function WatchlistButton({
  movieId,
  isInWatchlist = false,
  currentStatus,
  onStatusChange,
  variant = "outline",
  size = "default",
}: WatchlistButtonProps) {
  const [loading, setLoading] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist)
  const [status, setStatus] = useState(currentStatus)
  const { user } = useAuth()
  const router = useRouter()

  const handleStatusChange = async (newStatus: "want_to_watch" | "watching" | "watched") => {
    if (!user) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setInWatchlist(true)
        setStatus(newStatus)
        onStatusChange?.(newStatus)
      } else {
        console.error("Failed to add to watchlist")
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/watchlist?movieId=${movieId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInWatchlist(false)
        setStatus(undefined)
        onStatusChange?.(null)
      } else {
        console.error("Failed to remove from watchlist")
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Button variant={variant} size={size} onClick={() => router.push("/login")} className="gap-2">
        <Plus className="h-4 w-4" />
        My List
      </Button>
    )
  }

  if (inWatchlist && status) {
    const StatusIcon = statusIcons[status]

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size={size} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <StatusIcon className="h-4 w-4" />}
            {statusLabels[status]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-gray-700">
          <DropdownMenuItem
            onClick={() => handleStatusChange("want_to_watch")}
            className="text-white hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Want to Watch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("watching")} className="text-white hover:bg-gray-800">
            <Loader2 className="mr-2 h-4 w-4" />
            Watching
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("watched")} className="text-white hover:bg-gray-800">
            <Check className="mr-2 h-4 w-4" />
            Watched
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemove} className="text-red-400 hover:bg-gray-800">
            Remove from List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          My List
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700">
        <DropdownMenuItem onClick={() => handleStatusChange("want_to_watch")} className="text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Want to Watch
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("watching")} className="text-white hover:bg-gray-800">
          <Loader2 className="mr-2 h-4 w-4" />
          Watching
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("watched")} className="text-white hover:bg-gray-800">
          <Check className="mr-2 h-4 w-4" />
          Watched
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

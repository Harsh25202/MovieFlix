import { LoadingSpinner } from "@/components/atoms/loading-spinner"

interface PageLoadingProps {
  text?: string
}

export function PageLoading({ text = "Loading..." }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

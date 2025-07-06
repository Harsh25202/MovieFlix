import Image from "next/image"

interface MoviePosterProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function MoviePoster({ src, alt, width = 300, height = 450, className = "" }: MoviePosterProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className="object-cover transition-transform hover:scale-105"
        crossOrigin="anonymous"
      />
    </div>
  )
}

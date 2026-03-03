'use client'

import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PosterThumbnailProps {
  posterUrl: string | null
  alt: string
  onClick?: () => void
}

export function PosterThumbnail({ posterUrl, alt, onClick }: PosterThumbnailProps) {
  if (!posterUrl) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded bg-muted',
          onClick && 'cursor-pointer hover:bg-muted/80'
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <ImageOff className="h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={posterUrl}
      alt={alt}
      className={cn(
        'h-10 w-10 rounded object-cover object-center',
        onClick && 'cursor-pointer hover:opacity-80'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    />
  )
}

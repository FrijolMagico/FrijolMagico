'use client'

import { ImageOff } from 'lucide-react'

interface PosterSectionProps {
  posterUrl: string | null
  alt?: string
}

export function PosterSection({ posterUrl, alt = 'Poster' }: PosterSectionProps) {
  return (
    <div data-poster-section className="flex flex-col gap-2">
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={alt}
          className="h-24 w-24 rounded object-cover object-center"
        />
      ) : (
        <div className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded bg-muted text-muted-foreground">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">Sin poster</span>
        </div>
      )}
    </div>
  )
}

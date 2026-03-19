'use client'

import { IconPhotoOff } from '@tabler/icons-react'
import { cn } from '@/shared/lib/utils'
import Image from 'next/image'

interface PosterThumbnailProps {
  posterUrl: string | null
  alt: string
  onClick?: () => void
}

const handleKeyDown =
  (onClick?: () => void) =>
  (e: React.KeyboardEvent<HTMLDivElement | HTMLImageElement>) => {
    if (!onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

export function PosterThumbnail({
  posterUrl,
  alt,
  onClick
}: PosterThumbnailProps) {
  if (!posterUrl) {
    return (
      <div
        className={cn(
          'bg-muted flex h-10 w-10 items-center justify-center rounded',
          onClick && 'hover:bg-muted/80 cursor-pointer'
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown(onClick)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Ver ${alt}` : undefined}
      >
        <IconPhotoOff className='text-muted-foreground h-5 w-5' />
      </div>
    )
  }

  return (
    <Image
      src={posterUrl}
      alt={alt}
      className={cn(
        'h-10 w-10 rounded object-cover object-center',
        onClick && 'cursor-pointer hover:opacity-80'
      )}
      width={40}
      height={40}
      onClick={onClick}
      onKeyDown={handleKeyDown(onClick)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Ver ${alt}` : undefined}
    />
  )
}

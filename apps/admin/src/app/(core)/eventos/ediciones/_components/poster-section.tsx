'use client'

import { IconPhotoOff } from '@tabler/icons-react'
import Image from 'next/image'
import { cn } from '@/shared/lib/utils'

interface PosterSectionProps {
  posterUrl: string | null
  alt?: string
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

export function PosterSection({
  posterUrl,
  alt = 'Poster',
  onClick
}: PosterSectionProps) {
  return (
    <div data-poster-section className='flex flex-col gap-2'>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={alt}
          className={cn(
            'h-24 w-24 rounded object-cover object-center',
            onClick && 'cursor-pointer hover:opacity-80'
          )}
          width={96}
          height={96}
          onClick={onClick}
          onKeyDown={handleKeyDown(onClick)}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          aria-label={onClick ? `Ver ${alt}` : undefined}
        />
      ) : (
        <div
          className={cn(
            'bg-muted text-muted-foreground flex h-24 w-24 flex-col items-center justify-center gap-2 rounded',
            onClick && 'cursor-pointer hover:opacity-80'
          )}
          onClick={onClick}
          onKeyDown={handleKeyDown(onClick)}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          aria-label={onClick ? `Ver ${alt}` : undefined}
        >
          <IconPhotoOff className='h-6 w-6' />
          <span className='text-xs'>Sin poster</span>
        </div>
      )}
    </div>
  )
}

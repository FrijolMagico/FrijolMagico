'use client'

import { cn } from '@/utils/cn'
import { usePosterDominantColor } from '@/hooks/usePosterDominantColor'

interface FestivalTimelineCardBacklightProps {
  isActive?: boolean
}

export const FestivalTimelineCardBacklight = ({
  isActive = false
}: FestivalTimelineCardBacklightProps) => {
  const { dominantColors, ref } = usePosterDominantColor()

  const colors = dominantColors?.length
    ? dominantColors
    : ['var(--color-secondary)', 'var(--color-primary)', 'var(--color-accent)']

  return (
    <div
      ref={ref}
      className={cn(
        'absolute -inset-1 -z-10 rounded-xl blur-2xl transition-opacity duration-500',
        isActive ? 'opacity-100' : 'opacity-30'
      )}
      style={{
        backgroundImage: `linear-gradient(0, ${colors.join(', ')})`,
        backgroundSize: '100% 100%'
      }}
    ></div>
  )
}

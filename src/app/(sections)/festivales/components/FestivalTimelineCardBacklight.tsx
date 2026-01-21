'use client'

import { usePosterDominantColor } from '@/hooks/usePosterDominantColor'

export const FestivalTimelineCardBacklight = () => {
  const { dominantColors, ref } = usePosterDominantColor()

  const colors = dominantColors?.length
    ? dominantColors
    : [
        'var(--color-fm-orange)',
        'var(--color-fm-green)',
        'var(--color-fm-yellow)',
      ]

  return (
    <div
      ref={ref}
      className='absolute inset-6 -z-10 rounded-3xl blur-3xl'
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '100% 100%',
      }}></div>
  )
}

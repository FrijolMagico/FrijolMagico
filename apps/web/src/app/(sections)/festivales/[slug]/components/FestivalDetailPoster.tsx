import Image from 'next/image'

import { cn } from '@/utils/cn'
import { FestivalTimelineCardBacklight } from '../../components/FestivalTimelineCardBacklight'

interface FestivalDetailPosterProps {
  posterUrl: string | null
  eventName: string
  editionName: string
  priority: boolean
  animationMode?: 'active'
}

export const FestivalDetailPoster = ({
  posterUrl,
  eventName,
  editionName,
  priority,
  animationMode
}: FestivalDetailPosterProps) => (
  <figure
    className='relative aspect-auto h-auto w-full'
    data-festival-entry={animationMode === 'active' ? 'poster' : undefined}
  >
    {posterUrl ? (
      <Image
        src={posterUrl}
        alt={`Afiche ${eventName} ${editionName}`}
        width={370}
        height={523}
        className='aspect-auto h-auto w-full rounded-xl object-cover'
        priority={priority}
        sizes='(max-width: 768px) 320px, 370'
      />
    ) : (
      <div
        className={cn(
          'from-palette-secondary to-palette-accent flex size-full flex-col items-center justify-center',
          'border-palette-primary rounded-xl border-2 bg-linear-to-br p-4 text-center shadow-xl'
        )}
      >
        <span className='text-palette-background text-3xl leading-none font-black drop-shadow-lg md:text-5xl'>
          {eventName}
        </span>
        {editionName && (
          <span className='text-palette-background mt-2 text-xl font-semibold md:text-2xl'>
            {editionName}
          </span>
        )}
      </div>
    )}
    <FestivalTimelineCardBacklight isActive />
  </figure>
)

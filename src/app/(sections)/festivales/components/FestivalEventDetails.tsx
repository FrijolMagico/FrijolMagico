import { Calendar, MapPin } from 'lucide-react'

interface FestivalEventDetailsProps {
  daysDisplay: string | null
  locationDisplay: string | null
}

export const FestivalEventDetails = ({
  daysDisplay,
  locationDisplay,
}: FestivalEventDetailsProps) => (
  <nav className='space-y-2' aria-label='Event details'>
    {daysDisplay && (
      <div className='text-fm-black/70 flex items-center gap-3'>
        <Calendar className='size-4' />
        <time className='text-sm leading-none font-semibold'>
          {daysDisplay}
        </time>
      </div>
    )}

    {locationDisplay && (
      <div className='text-fm-black/70 flex items-center gap-3'>
        <MapPin className='size-4' />
        <address className='text-sm leading-none font-medium not-italic'>
          {locationDisplay}
        </address>
      </div>
    )}
  </nav>
)

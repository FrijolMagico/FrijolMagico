import { Calendar, MapPin } from 'lucide-react'

interface FestivalEventDetailsProps {
  daysDisplay: string | null
  locationDisplay: string | null
}

export const FestivalEventDetails = ({
  daysDisplay,
  locationDisplay,
}: FestivalEventDetailsProps) => (
  <dl className='space-y-2'>
    {daysDisplay && (
      <div className='text-fm-black/70 flex items-center gap-3'>
        <Calendar className='size-4 shrink-0' aria-hidden='true' />
        <div>
          <dt className='sr-only'>Fechas del evento</dt>
          <dd className='text-sm leading-none font-semibold'>{daysDisplay}</dd>
        </div>
      </div>
    )}

    {locationDisplay && (
      <div className='text-fm-black/70 flex items-center gap-3'>
        <MapPin className='size-4 shrink-0' aria-hidden='true' />
        <div>
          <dt className='sr-only'>Ubicación</dt>
          <dd className='text-sm leading-none font-medium'>
            {locationDisplay}
          </dd>
        </div>
      </div>
    )}
  </dl>
)

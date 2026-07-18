import { Calendar, MapPin } from 'lucide-react'

interface FestivalEventDetailsProps {
  daysDisplay: string | null
  locationDisplay: string | null
}

export const FestivalEventDetails = ({
  daysDisplay,
  locationDisplay
}: FestivalEventDetailsProps) => (
  <dl className='space-y-.5'>
    {daysDisplay && (
      <div className='text-foreground/70 flex items-center gap-3'>
        <Calendar className='size-3 shrink-0' aria-hidden='true' />
        <div>
          <dt className='sr-only'>Fechas del evento</dt>
          <dd className='font-roboto-mono text-xs tracking-tighter'>
            {daysDisplay}
          </dd>
        </div>
      </div>
    )}

    {locationDisplay && (
      <div className='text-foreground/70 flex items-center gap-3'>
        <MapPin className='size-3 shrink-0' aria-hidden='true' />
        <div>
          <dt className='sr-only'>Ubicación</dt>
          <dd className='font-roboto-mono text-xs tracking-tighter'>
            {locationDisplay}
          </dd>
        </div>
      </div>
    )}
  </dl>
)

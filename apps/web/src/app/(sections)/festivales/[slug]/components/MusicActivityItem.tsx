import { ActivityArtistLink } from './ActivityArtistLink'
import { formatOccurrenceTimeRange } from './activity-registration-time'

import type { FestivalActivity } from '../../types/festival'

interface MusicActivityItemProps {
  activity: FestivalActivity
}

export const MusicActivityItem = ({ activity }: MusicActivityItemProps) => (
  <article className='bg-palette-background relative max-w-sm'>
    <ActivityArtistLink
      pseudonym={activity.participante_pseudonimo}
      catalogSlug={activity.catalogo_slug}
      avatarUrl={activity.avatar_url}
      rrss={activity.rrss}
      email={activity.correo}
      className='text-palette-primary block text-center text-lg font-semibold md:text-start'
    />
    <ul className='mt-2 space-y-1'>
      {activity.ocurrencias.map((occurrence, index) => {
        const timeRange = formatOccurrenceTimeRange(
          occurrence.hora_inicio,
          occurrence.duracion_minutos
        )
        const multipleOccurrences = activity.ocurrencias.length > 1

        if (!multipleOccurrences && !timeRange) return null

        return (
          <li key={occurrence.id ?? `${occurrence.fecha}-${index}`}>
            <p className='text-palette-foreground text-center text-sm md:text-start'>
              {multipleOccurrences
                ? `Bloque ${index + 1}${timeRange ? `: ${timeRange}` : ''}`
                : timeRange}
            </p>
          </li>
        )
      })}
    </ul>
  </article>
)

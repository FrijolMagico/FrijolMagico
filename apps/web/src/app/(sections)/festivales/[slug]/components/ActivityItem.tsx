import { ChevronDown, MapPin } from 'lucide-react'

import { ActivityRegistrationCta } from './activity-registration-affordance'
import { ActivityDescription } from './activity-description'
import { ActivityArtistLink } from './ActivityArtistLink'
import { formatOccurrenceTimeRange } from './activity-registration-time'

import type { FestivalActivity } from '../../types/festival'

interface ActivityItemProps {
  activity: FestivalActivity
  isEditionPast?: boolean
}

const hasDetails = (activity: FestivalActivity) =>
  Boolean(activity.ubicacion || activity.descripcion)

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  const details = hasDetails(activity)
  const multipleOccurrences = activity.ocurrencias.length > 1

  return (
    <article className='bg-palette-background border-palette-primary group relative max-w-[calc(100%-1rem)] min-w-[16rem] rounded-lg border sm:max-w-xs'>
      <div className='bg-palette-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-300 group-hover:translate-0' />

      <div className='px-4 pt-3'>
        <ActivityArtistLink
          pseudonym={activity.participante_pseudonimo}
          catalogSlug={activity.catalogo_slug}
          avatarUrl={activity.avatar_url}
          rrss={activity.rrss}
          email={activity.correo}
        />
      </div>

      <div className='px-4 py-3'>
        {activity.titulo && (
          <h3 className='text-palette-foreground text-base leading-none font-semibold'>
            {activity.titulo}
          </h3>
        )}

        <ul className='mt-2 space-y-3'>
          {activity.ocurrencias.map((occurrence, index) => {
            const timeRange = formatOccurrenceTimeRange(
              occurrence.hora_inicio,
              occurrence.duracion_minutos
            )
            return (
              <li key={occurrence.id ?? `${occurrence.fecha}-${index}`}>
                {multipleOccurrences && (
                  <p className='text-palette-foreground text-sm'>
                    Bloque {index + 1}:{timeRange ? ` ${timeRange}` : ''}
                  </p>
                )}
                {!multipleOccurrences && timeRange && (
                  <p className='text-palette-foreground text-sm'>{timeRange}</p>
                )}
                {activity.registration && (
                  <ActivityRegistrationCta
                    registration={activity.registration}
                    url={occurrence.registration_url ?? null}
                  />
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {details && (
        <details className='group/details'>
          <summary className='flex w-full cursor-pointer items-center justify-between border-t px-4 py-2 text-left marker:content-none'>
            <span className='text-palette-foreground/70 text-sm'>Detalles</span>
            <ChevronDown
              className='text-palette-foreground/40 size-5 shrink-0 transition-transform duration-200 group-open/details:rotate-180'
              aria-hidden='true'
            />
          </summary>
          <div className='border-palette-primary/20 h-full overflow-hidden border-t px-4 pt-3 pb-4'>
            {activity.ubicacion && (
              <div className='mb-2 flex items-center gap-1.5 text-sm'>
                <MapPin className='size-4' aria-hidden='true' />
                <span>{activity.ubicacion}</span>
              </div>
            )}
            <ActivityDescription description={activity.descripcion} />
          </div>
        </details>
      )}
    </article>
  )
}

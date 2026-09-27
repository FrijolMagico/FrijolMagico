import { ChevronDown, Clock, MapPin } from 'lucide-react'
import { formatSantiagoDateTime } from '@frijolmagico/utils/santiago-date-format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { ActivityRegistrationCta } from './activity-registration-affordance'

import type { FestivalActivity } from '../../types/festival'

interface ActivityItemProps {
  activity: FestivalActivity
  isEditionPast: boolean
}

const hasDetails = (a: FestivalActivity) =>
  Boolean(a.ocurrencias.length || a.ubicacion || a.descripcion)

const formatSessionDate = (date: string) =>
  format(new Date(date + 'T00:00:00'), 'd MMM yyyy', { locale: es })

export const ActivityItem = ({ activity, isEditionPast }: ActivityItemProps) => {
  const details = hasDetails(activity)

  return (
    <article className='bg-palette-background border-palette-primary group relative max-w-xs min-w-[16rem] rounded-lg border'>
      <div className='bg-palette-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-300 group-hover:translate-0' />
      {activity.tipo !== 'musica' && activity.registration && (
        <ActivityRegistrationCta registration={activity.registration} />
      )}

      {details ? (
        <details className='group/details'>
          <summary className='flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left marker:content-none'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex flex-wrap items-center gap-2'>
                {activity.participante_pseudonimo && (
                  <span className='text-palette-primary/70 text-sm'>
                    {activity.participante_pseudonimo}
                  </span>
                )}
              </div>

              {activity.titulo && (
                <h3 className='text-palette-foreground text-base leading-none font-semibold'>
                  {activity.titulo}
                </h3>
              )}

              {activity.registration && (
                <span className='text-palette-foreground/50 mt-1 inline-block text-sm leading-none'>
                  Inscripciones abiertas hasta el{' '}
                  <strong>
                    {formatSantiagoDateTime(activity.registration.end_at)}hrs
                  </strong>
                </span>
              )}
            </div>

            <ChevronDown
              className='text-palette-foreground/40 size-5 shrink-0 transition-transform duration-200 group-open/details:rotate-180'
              aria-hidden='true'
            />
          </summary>

          <div className='border-palette-primary/20 h-full overflow-hidden border-t px-4 pt-3 pb-4'>
            <div className='text-foreground/60 flex flex-wrap gap-4 text-sm'>
              {activity.ocurrencias.length > 0 ? (
                <div className='space-y-2'>
                  <h4 className='text-palette-foreground font-medium text-sm'>Horarios</h4>
                  <ul className='space-y-1'>
                    {activity.ocurrencias.map((occurrence) => (
                      <li
                        key={`${occurrence.fecha}-${occurrence.hora_inicio}`}
                        className='flex items-center gap-1.5'
                      >
                        <Clock className='size-4' aria-hidden='true' />
                        <time dateTime={`${occurrence.fecha}T${occurrence.hora_inicio}:00`}>
                          {formatSessionDate(occurrence.fecha)} — {occurrence.hora_inicio}
                        </time>
                        <span>({occurrence.duracion_minutos} min)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (!isEditionPast ? (
                <span>Fecha y horario por confirmar</span>
              ) : null)}
              {activity.ubicacion && (
                <div className='flex items-center gap-1.5'>
                  <MapPin className='size-4' aria-hidden='true' />
                  <span>{activity.ubicacion}</span>
                </div>
              )}
            </div>
            {activity.descripcion && (
              <p className='text-palette-foreground/70 mt-3 text-sm leading-relaxed'>
                {activity.descripcion}
              </p>
            )}
          </div>
        </details>
      ) : (
        <div className='px-4 py-3'>
          <div className='mb-1 flex flex-wrap items-center gap-2'>
            {activity.participante_pseudonimo && (
              <span className='text-palette-primary/70 text-sm'>
                {activity.participante_pseudonimo}
              </span>
            )}
          </div>

          {activity.titulo && (
            <h3 className='text-palette-foreground text-base leading-none font-semibold'>
              {activity.titulo}
            </h3>
          )}
          {activity.tipo !== 'musica' && !isEditionPast && (
            <p className='text-palette-foreground/60 mt-2 text-sm'>
              Fecha y horario por confirmar
            </p>
          )}
        </div>
      )}
    </article>
  )
}
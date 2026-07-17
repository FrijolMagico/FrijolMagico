import { ChevronDown, Clock, MapPin } from 'lucide-react'

import type { FestivalActivity } from '../../types/festival'

interface ActivityItemProps {
  activity: FestivalActivity
}

const hasDetails = (a: FestivalActivity) =>
  Boolean(
    a.hora_inicio ||
    a.fecha ||
    a.ubicacion ||
    a.descripcion ||
    a.duracion_minutos
  )

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  const details = hasDetails(activity)

  const timeDisplay = [activity.fecha, activity.hora_inicio]
    .filter(Boolean)
    .join(' — ')

  return (
    <article className='bg-palette-background border-palette-primary group relative max-w-xs min-w-[16rem] rounded-lg border'>
      <div className='bg-palette-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-300 group-hover:translate-0' />

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
            </div>

            <ChevronDown
              className='text-palette-foreground/40 size-5 shrink-0 transition-transform duration-200 group-open/details:rotate-180'
              aria-hidden='true'
            />
          </summary>

          <div className='border-palette-primary/20 h-full overflow-hidden border-t px-4 pt-3 pb-4'>
            <div className='text-foreground/60 flex flex-wrap gap-4 text-sm'>
              {timeDisplay && (
                <div className='flex items-center gap-1.5'>
                  <Clock className='size-4' aria-hidden='true' />
                  <time>{timeDisplay}</time>
                </div>
              )}
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
            {activity.duracion_minutos && (
              <p className='text-palette-foreground/50 mt-1 text-xs'>
                Duración: {activity.duracion_minutos} min
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
        </div>
      )}
    </article>
  )
}

import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/badge'

import { ActivityRegistrationCta } from './activity-registration-affordance'
import { ActivityDescription } from './activity-description'
import { ActivityArtistLink } from './ActivityArtistLink'
import { formatOccurrenceTimeRange } from '../lib/activity-registration-time'

import type { FestivalActivity } from '../../types/festival'
import { cn } from '@/utils/cn'

interface ActivityItemProps {
  activity: FestivalActivity
  isEditionPast?: boolean
  badge?: string
}

const EMPTY_EDITOR_MARKUP =
  /<\/?(?:p|ul|ol|li|strong|em|s|code|a)\b[^>]*>|<br\b[^>]*\/?>/gi
const EMPTY_EDITOR_SPACE = /(?:&nbsp;|&#160;|&#xA0;)/gi

const hasDescription = (description: string | null) =>
  Boolean(
    description
      ?.replace(EMPTY_EDITOR_MARKUP, '')
      .replace(EMPTY_EDITOR_SPACE, '')
      .trim()
  )

const getBadgeClassName = (type: string) => {
  if (type === 'charla') return 'bg-primary text-background'
  if (type === 'musica') return 'bg-secondary text-primary'
  return 'bg-accent text-primary'
}

export const ActivityItem = ({ activity, badge }: ActivityItemProps) => {
  const details = hasDescription(activity.descripcion)
  const occurrence = activity.ocurrencias[0]
  const timeRange = occurrence
    ? formatOccurrenceTimeRange(
        occurrence.hora_inicio,
        occurrence.duracion_minutos
      )
    : null

  return (
    <article className='bg-palette-background border-palette-primary group relative w-full min-w-0 rounded-lg border'>
      <div className='bg-palette-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-300 group-hover:translate-0' />

      {badge && (
        <Badge
          className={cn(getBadgeClassName(activity.tipo), '-top-3 left-4')}
        >
          {badge}
        </Badge>
      )}

      {activity.registration && occurrence && (
        <div className='absolute -top-6 right-4 z-30'>
          <ActivityRegistrationCta
            registration={activity.registration}
            url={occurrence.registration_url ?? null}
          />
        </div>
      )}

      {details ? (
        <details className='group/details'>
          <summary className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 pb-4 text-left marker:content-none before:absolute before:inset-0 before:z-10 before:cursor-pointer before:content-['']">
            <div className='min-w-0 flex-1'>
              <ActivityArtistLink
                pseudonym={activity.participante_pseudonimo}
                catalogSlug={activity.catalogo_slug}
                avatarUrl={activity.avatar_url}
                rrss={activity.rrss}
                email={activity.correo}
                className='text-palette-primary/70 wrap-break-words relative z-20 max-w-full pt-6 pb-2 text-sm'
              />
              {activity.tipo === 'charla' && activity.presenter_nombre && (
                <p className='text-palette-primary/70 mt-1 text-sm'>
                  Presenta:{' '}
                  <ActivityArtistLink
                    pseudonym={activity.presenter_nombre}
                    catalogSlug={activity.presenter_catalogo_slug}
                    className='text-palette-primary/70 wrap-break-words relative z-20 max-w-full text-sm'
                  />
                </p>
              )}

              <div>
                {activity.titulo && (
                  <h3 className='text-palette-foreground text-base leading-tight font-bold'>
                    {activity.titulo}
                  </h3>
                )}
              </div>
              {(timeRange || activity.ubicacion) && (
                <div
                  className={`${activity.titulo ? 'mt-2' : 'mt-1'} space-y-0.5 leading-tight`}
                >
                  {timeRange && (
                    <p className='text-palette-foreground/70 text-sm leading-tight'>
                      {timeRange}
                    </p>
                  )}
                  {activity.ubicacion && (
                    <p className='text-palette-foreground/60 text-sm leading-tight'>
                      {activity.ubicacion}
                    </p>
                  )}
                </div>
              )}
            </div>
            <ChevronDown
              className='text-palette-foreground/40 size-5 shrink-0 transition-transform duration-200 group-open/details:rotate-180'
              aria-hidden='true'
            />
          </summary>
          <div
            data-disclosure-content
            className='border-palette-primary/20 pointer-events-none relative z-20 h-full overflow-hidden border-t px-4 pt-3 pb-4 *:pointer-events-auto'
          >
            <ActivityDescription description={activity.descripcion} />
          </div>
        </details>
      ) : (
        <div className='px-4 py-3'>
          <ActivityArtistLink
            pseudonym={activity.participante_pseudonimo}
            catalogSlug={activity.catalogo_slug}
            avatarUrl={activity.avatar_url}
            rrss={activity.rrss}
            email={activity.correo}
            className='text-palette-primary/70 wrap-break-words relative z-20 max-w-full pt-6 pb-2 text-sm'
          />
          {activity.tipo === 'charla' && activity.presenter_nombre && (
            <p className='text-palette-primary/70 mt-1 text-sm'>
              Presenta:{' '}
              <ActivityArtistLink
                pseudonym={activity.presenter_nombre}
                catalogSlug={activity.presenter_catalogo_slug}
                className='text-palette-primary/70 wrap-break-words relative z-20 max-w-full text-sm'
              />
            </p>
          )}
          <div>
            {activity.titulo && (
              <h3 className='text-palette-foreground text-base leading-none font-semibold'>
                {activity.titulo}
              </h3>
            )}
          </div>
          {(timeRange || activity.ubicacion) && (
            <div
              className={`${activity.titulo ? 'mt-2' : 'mt-1'} space-y-0.5 leading-tight`}
            >
              {timeRange && (
                <p className='text-palette-foreground/70 text-sm leading-tight'>
                  {timeRange}
                </p>
              )}
              {activity.ubicacion && (
                <p className='text-palette-foreground/60 text-sm leading-tight'>
                  {activity.ubicacion}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

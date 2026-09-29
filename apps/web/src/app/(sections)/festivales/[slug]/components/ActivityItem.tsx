import { ChevronDown } from 'lucide-react'

import { ActivityRegistrationCta } from './activity-registration-affordance'
import { ActivityDescription } from './activity-description'
import { ActivityArtistLink } from './ActivityArtistLink'
import { formatOccurrenceTimeRange } from './activity-registration-time'

import type { FestivalActivity } from '../../types/festival'

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
  if (type === 'charla') return 'bg-palette-secondary/15 border-palette-secondary/40'
  if (type === 'musica') return 'bg-palette-accent/15 border-palette-accent/40'
  return 'bg-palette-primary/10 border-palette-primary/40'
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

      {activity.registration && occurrence && (
        <div className='absolute -top-5 -right-3 z-30'>
          <ActivityRegistrationCta
            registration={activity.registration}
            url={occurrence.registration_url ?? null}
          />
        </div>
      )}

      <div
        className={`relative z-20 min-w-0 break-words px-4 pt-3 ${
          activity.registration && occurrence ? 'pr-28' : ''
        }`}
      >
        <ActivityArtistLink
          pseudonym={activity.participante_pseudonimo}
          catalogSlug={activity.catalogo_slug}
          avatarUrl={activity.avatar_url}
          rrss={activity.rrss}
          email={activity.correo}
          className='max-w-full break-words text-palette-primary/70 text-sm'
        />
        {activity.tipo === 'charla' && activity.presenter_nombre && (
          <p className='mt-1 text-palette-primary/70 text-sm'>
            Presenta:{' '}
            <ActivityArtistLink
              pseudonym={activity.presenter_nombre}
              catalogSlug={activity.presenter_catalogo_slug}
              className='max-w-full break-words text-palette-primary/70 text-sm'
            />
          </p>
        )}
      </div>

      {details ? (
        <details className='group/details'>
          <summary className="before:content-[''] before:absolute before:inset-0 before:z-10 before:cursor-pointer flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left marker:content-none">
            <div className='min-w-0 flex-1'>
              <div>
                {badge && (
                  <span
                    className={`text-palette-foreground mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getBadgeClassName(activity.tipo)}`}
                  >
                    {badge}
                  </span>
                )}
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
                    <p className='text-palette-foreground/70 leading-tight text-sm'>
                      {timeRange}
                    </p>
                  )}
                  {activity.ubicacion && (
                    <p className='text-palette-foreground/60 leading-tight text-sm'>
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
            className='relative z-20 pointer-events-none [&>*]:pointer-events-auto border-palette-primary/20 h-full overflow-hidden border-t px-4 pt-3 pb-4'
          >
            <ActivityDescription description={activity.descripcion} />
          </div>
        </details>
      ) : (
        <div className='px-4 py-3'>
          <div>
            {badge && (
              <span
                className={`text-palette-foreground mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getBadgeClassName(activity.tipo)}`}
              >
                {badge}
              </span>
            )}
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
                <p className='text-palette-foreground/70 leading-tight text-sm'>
                  {timeRange}
                </p>
              )}
              {activity.ubicacion && (
                <p className='text-palette-foreground/60 leading-tight text-sm'>
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

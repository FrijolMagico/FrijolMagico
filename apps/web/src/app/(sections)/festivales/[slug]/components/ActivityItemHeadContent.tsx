import type { FestivalActivity } from '../../types/festival'

import { ActivityArtistLink } from './ActivityArtistLink'

const PRESENTER_LINK_CLASSNAME =
  'text-palette-primary/70 wrap-break-words relative z-20 max-w-full text-sm'

interface ActivityItemHeadContentProps {
  activity: FestivalActivity
  timeRange: string | null
}

export const ActivityItemHeadContent = ({
  activity,
  timeRange
}: ActivityItemHeadContentProps) => {
  return (
    <div className='flex flex-col gap-2 pt-6 pb-4'>
      <div>
        <ActivityArtistLink
          pseudonym={activity.participante_pseudonimo}
          catalogSlug={activity.catalogo_slug}
          avatarUrl={activity.avatar_url}
          rrss={activity.rrss}
          email={activity.correo}
          className={PRESENTER_LINK_CLASSNAME}
        />
        {activity.tipo === 'charla' && activity.presenter_nombre && (
          <p className='text-palette-primary/70 text-sm'>
            <strong>Presenta: </strong>
            <ActivityArtistLink
              pseudonym={activity.presenter_nombre}
              catalogSlug={activity.presenter_catalogo_slug}
              className={PRESENTER_LINK_CLASSNAME}
            />
          </p>
        )}
      </div>

      {activity.titulo && (
        <h3 className='text-palette-foreground text-lg leading-tight font-bold'>
          {activity.titulo}
        </h3>
      )}
      {(timeRange || activity.ubicacion) && (
        <div className='mt-auto space-y-0.5'>
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
  )
}

import { ActivityArtistLink } from './ActivityArtistLink'

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
  </article>
)

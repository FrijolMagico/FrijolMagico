import type { FestivalActivity } from '../../types/festival'

interface MusicActivityItemProps {
  activity: FestivalActivity
}

export const MusicActivityItem = ({ activity }: MusicActivityItemProps) => (
  <article className='bg-palette-background relative max-w-sm'>
    {activity.participante_pseudonimo && (
      <span className='text-palette-primary block text-center text-lg font-semibold md:text-start'>
        {activity.participante_pseudonimo}
      </span>
    )}
  </article>
)

import { ParticipantItem } from './ParticipantItem'

import type { FestivalParticipant } from '../../types/festival'

interface ParticipantByDisciplineProps {
  disciplineLabel: string
  participants: FestivalParticipant[]
  animationMode?: 'active'
}

export const ParticipantByDiscipline = ({
  disciplineLabel,
  participants,
  animationMode
}: ParticipantByDisciplineProps) => (
  <section
    className='w-full space-y-2 text-center md:w-auto md:text-start'
    data-spoiler-category={
      animationMode === 'active' ? disciplineLabel : undefined
    }
    data-spoiler-state={animationMode === 'active' ? 'concealed' : undefined}
  >
    <h3 className='text-palette-accent font-canarina text-4xl font-black'>
      {disciplineLabel}
    </h3>
    <ul className='flex w-full flex-wrap justify-center gap-x-3 gap-y-2 md:justify-start'>
      {participants.map((participant, index) => (
        <li
          key={participant.pseudonimo}
          className='flex shrink-0 items-center gap-3 break-inside-avoid'
        >
          <ParticipantItem
            pseudonimo={participant.pseudonimo}
            catalogoSlug={participant.catalogo_slug}
            avatarUrl={participant.avatar_url}
            rrss={participant.rrss}
            animationMode={animationMode}
            categoryId={disciplineLabel}
            itemIndex={index}
          />
          {index < participants.length - 1 && (
            <span
              aria-hidden='true'
              className='bg-palette-foreground/50 size-1.5 shrink-0 rounded-full'
            />
          )}
        </li>
      ))}
    </ul>
  </section>
)

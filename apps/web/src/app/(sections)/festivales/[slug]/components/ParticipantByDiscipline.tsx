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
    className='w-full text-center md:w-auto md:text-start'
    data-spoiler-category={
      animationMode === 'active' ? disciplineLabel : undefined
    }
    data-spoiler-state={animationMode === 'active' ? 'concealed' : undefined}
  >
    <h3 className='text-palette-accent mb-3 font-mono text-2xl font-bold'>
      {disciplineLabel}
    </h3>
    <ul className='w-full columns-1 space-y-1 md:columns-2 md:gap-x-8'>
      {participants.map((participant) => (
        <li key={participant.pseudonimo} className='break-inside-avoid'>
          <ParticipantItem
            pseudonimo={participant.pseudonimo}
            catalogoSlug={participant.catalogo_slug}
            avatarUrl={participant.avatar_url}
            rrss={participant.rrss}
            animationMode={animationMode}
            categoryId={disciplineLabel}
            itemIndex={participants.indexOf(participant)}
          />
        </li>
      ))}
    </ul>
  </section>
)

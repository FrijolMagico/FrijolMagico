import { ParticipantItem } from './ParticipantItem'

import type { FestivalParticipant } from '../../types/festival'

interface ParticipantByDisciplineProps {
  disciplineLabel: string
  participants: FestivalParticipant[]
}

export const ParticipantByDiscipline = ({
  disciplineLabel,
  participants
}: ParticipantByDisciplineProps) => (
  <section className='w-full text-center md:w-auto md:text-start'>
    <h3 className='text-accent mb-3 font-mono text-2xl font-bold'>
      {disciplineLabel}
    </h3>
    <ul className='w-full columns-1 space-y-1 md:columns-2 md:gap-x-8'>
      {participants.map((participant) => (
        <li key={participant.pseudonimo} className='break-inside-avoid'>
          <ParticipantItem
            pseudonimo={participant.pseudonimo}
            catalogoSlug={participant.catalogo_slug}
          />
        </li>
      ))}
    </ul>
  </section>
)

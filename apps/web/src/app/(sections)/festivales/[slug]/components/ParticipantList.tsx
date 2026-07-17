import { ParticipantByDiscipline } from './ParticipantByDiscipline'

import type { FestivalParticipant } from '../../types/festival'

interface ParticipantListProps {
  participantes: FestivalParticipant[]
  animationMode?: 'active'
}

export const ParticipantList = ({
  participantes,
  animationMode
}: ParticipantListProps) => {
  if (participantes.length === 0) {
    return (
      <section
        data-festival-entry={
          animationMode === 'active' ? 'participants' : undefined
        }
      >
        <h2 className='text-palette-primary mb-6 w-full text-center text-4xl font-bold md:text-start'>
          Participantes
        </h2>
        <p className='text-palette-foreground/60 w-full text-center md:w-auto md:text-start'>
          Sin participantes registrados aún
        </p>
      </section>
    )
  }

  const grouped = participantes.reduce<Record<string, FestivalParticipant[]>>(
    (acc, participant) => {
      const key = participant.disciplina_slug
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(participant)
      return acc
    },
    {}
  )

  return (
    <section
      data-festival-entry={
        animationMode === 'active' ? 'participants' : undefined
      }
    >
      <h2 className='text-palette-primary mb-6 w-full text-center text-4xl font-bold md:text-start'>
        Participantes
      </h2>
      <div className='flex flex-wrap gap-6'>
        {Object.entries(grouped).map(([disciplineLabel, group]) => (
          <ParticipantByDiscipline
            key={disciplineLabel}
            disciplineLabel={disciplineLabel}
            participants={group}
            animationMode={animationMode}
          />
        ))}
      </div>
    </section>
  )
}

import { Participant } from '../_types/participations.types'
import {
  ACTIVITY_TYPE_LABELS,
  ActivityId,
  DISCIPLINE_LABELS,
  DisciplineId
} from '../_constants/participations.constants'
import { ParticipantsGroup } from './participants-group'

interface ParticipantsConainerProps {
  participations: Participant[]
}

export function ParticipantsContainer({
  participations
}: ParticipantsConainerProps) {
  const exhibitions = participations.flatMap(({ exhibition, entity }) => {
    if (!exhibition) return []
    return {
      participation: exhibition,
      entity
    }
  })

  const activities = participations.flatMap(({ entity, activities }) =>
    (activities || []).map((activity) => ({ participation: activity, entity }))
  )

  const groupByDiscipline = Object.groupBy(
    exhibitions,
    ({ participation }) => participation.disciplinaId
  )

  const groupByActivityType = Object.groupBy(
    activities,
    ({ participation }) => participation.tipoActividadId
  )

  const haveActivities = activities.length > 0

  return (
    <article className='flex w-full gap-6'>
      <section className='w-full space-y-4'>
        <div>
          <h2 className='text-xl font-bold'>Exhibiciones</h2>
          <span className='text-muted-foreground text-sm font-normal'>
            Total: {exhibitions.length}
          </span>
        </div>
        {Object.entries(groupByDiscipline).map(([disciplineId, items]) => {
          if (!items) return null
          return (
            <ParticipantsGroup
              key={disciplineId}
              items={items}
              label={DISCIPLINE_LABELS[Number(disciplineId) as DisciplineId]}
            />
          )
        })}
      </section>
      {haveActivities && (
        <section className='w-full space-y-4'>
          <div>
            <h2 className='text-xl font-bold'>Actividades</h2>
            <span className='text-muted-foreground text-sm font-normal'>
              Total: {activities.length}
            </span>
          </div>
          {Object.entries(groupByActivityType).map(
            ([activityTypeId, items]) => {
              if (!items) return null
              return (
                <ParticipantsGroup
                  key={activityTypeId}
                  items={items}
                  label={
                    ACTIVITY_TYPE_LABELS[Number(activityTypeId) as ActivityId]
                  }
                />
              )
            }
          )}
        </section>
      )}
    </article>
  )
}

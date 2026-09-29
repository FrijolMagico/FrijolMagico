import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { ActivityItem } from './ActivityItem'
import { MusicActivityItem } from './MusicActivityItem'

import type { FestivalActivity } from '../../types/festival'

interface ActivityListProps {
  actividades: FestivalActivity[]
  isEditionPast: boolean
}

const TYPE_LABELS: Record<string, string> = {
  musica: 'Música',
  taller: 'Talleres',
  charla: 'Charlas'
}

const TYPE_ORDER: Record<string, number> = {
  taller: 0,
  charla: 1,
  musica: 99
}

export const ActivityList = ({ actividades }: ActivityListProps) => {
  const days = new Map<
    string,
    Map<string, Array<{ activity: FestivalActivity; occurrence: FestivalActivity['ocurrencias'][number] }>>
  >()

  actividades.forEach((activity) => {
    activity.ocurrencias.forEach((occurrence) => {
      let types = days.get(occurrence.fecha)
      if (!types) {
        types = new Map()
        days.set(occurrence.fecha, types)
      }
      let occurrences = types.get(activity.tipo)
      if (!occurrences) {
        occurrences = []
        types.set(activity.tipo, occurrences)
      }
      occurrences.push({ activity, occurrence })
    })
  })

  return (
    <section>
      <h2 className='text-palette-primary mb-6 w-full text-center text-4xl font-bold md:text-start'>
        Actividades
      </h2>
      <div className='space-y-10'>
        {[...days.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, types]) => (
            <section key={date} aria-label={`Actividades del ${date}`}>
              <h3 className='text-palette-accent mb-4 font-mono text-2xl font-bold'>
                {format(new Date(`${date}T00:00:00`), 'd MMMM yyyy', { locale: es })}
              </h3>
              <div className='flex flex-wrap gap-12'>
                {[...types.entries()]
                  .sort(([a], [b]) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99))
                  .map(([type, occurrences]) => (
                    <section key={type} className='flex-1'>
                      <h4 className='text-palette-accent mb-3 text-center font-mono text-xl font-bold md:text-start'>
                        {TYPE_LABELS[type] ?? type}
                      </h4>
                      <ul className={type === 'musica' ? 'space-y-2' : 'space-y-8'}>
                        {occurrences.map(({ activity, occurrence }, index) => {
                          const occurrenceActivity = {
                            ...activity,
                            ocurrencias: [occurrence]
                          }
                          return (
                            <li
                              key={`${type}-${activity.titulo ?? index}-${occurrence.id ?? index}-${index}`}
                            >
                              {type === 'musica' ? (
                                <MusicActivityItem activity={occurrenceActivity} />
                              ) : (
                                <ActivityItem activity={occurrenceActivity} />
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </section>
  )
}

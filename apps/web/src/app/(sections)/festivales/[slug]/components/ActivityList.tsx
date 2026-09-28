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
    Map<string, Map<FestivalActivity, FestivalActivity>>
  >()

  actividades.forEach((activity) => {
    activity.ocurrencias.forEach((occurrence) => {
      let types = days.get(occurrence.fecha)
      if (!types) {
        types = new Map()
        days.set(occurrence.fecha, types)
      }
      let activities = types.get(activity.tipo)
      if (!activities) {
        activities = new Map()
        types.set(activity.tipo, activities)
      }
      let dayActivity = activities.get(activity)
      if (!dayActivity) {
        dayActivity = { ...activity, ocurrencias: [] }
        activities.set(activity, dayActivity)
      }
      if (
        occurrence.id === undefined ||
        !dayActivity.ocurrencias.some(({ id }) => id === occurrence.id)
      ) {
        dayActivity.ocurrencias.push(occurrence)
      }
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
                  .map(([type, group]) => (
                    <section key={type} className='flex-1'>
                      <h4 className='text-palette-accent mb-3 text-center font-mono text-xl font-bold md:text-start'>
                        {TYPE_LABELS[type] ?? type}
                      </h4>
                      <ul className={type === 'musica' ? 'space-y-2' : 'space-y-8'}>
                        {[...group.values()].map((activity, index) => (
                          <li key={`${type}-${activity.titulo ?? index}-${index}`}>
                            {type === 'musica' ? (
                              <MusicActivityItem activity={activity} />
                            ) : (
                              <ActivityItem activity={activity} />
                            )}
                          </li>
                        ))}
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

import { ActivityItem } from './ActivityItem'
import { MusicActivityItem } from './MusicActivityItem'

import type { FestivalActivity } from '../../types/festival'
import { cn } from '@/utils/cn'

interface ActivityListProps {
  actividades: FestivalActivity[]
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
  const sorted = [...actividades].sort((a, b) => {
    const dateA = a.fecha ?? ''
    const dateB = b.fecha ?? ''
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB)
    }
    return (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? '')
  })

  const grouped = sorted.reduce<Record<string, FestivalActivity[]>>(
    (acc, activity) => {
      const key = activity.tipo
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(activity)
      return acc
    },
    {}
  )

  return (
    <section>
      <h2 className='text-primary mb-6 w-full text-center text-4xl font-bold md:text-start'>
        Actividades
      </h2>
      <div className='flex flex-wrap gap-12 space-y-8'>
        {Object.entries(grouped)
          .sort(([a], [b]) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99))
          .map(([tipo, group]) => (
            <section key={tipo}>
              <h3 className='text-accent mb-3 font-mono text-2xl font-bold'>
                {TYPE_LABELS[tipo] ?? tipo}
              </h3>
              <ul className={cn(tipo === 'musica' ? 'space-y-2' : 'space-y-3')}>
                {group.map((activity, index) => (
                  <li key={`${tipo}-${activity.titulo ?? index}-${index}`}>
                    {tipo !== 'musica' ? (
                      <ActivityItem activity={activity} />
                    ) : (
                      <MusicActivityItem activity={activity} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </section>
  )
}

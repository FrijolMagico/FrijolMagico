'use client'

import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { ActivityItem } from './ActivityItem'
import { buildFestivalSchedule } from './festival-schedule'

import type { FestivalScheduleEntry } from './festival-schedule'
import type { FestivalActivity } from '../../types/festival'

interface ActivityListProps {
  actividades: FestivalActivity[]
  isEditionPast: boolean
}

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'taller', label: 'Talleres' },
  { value: 'charla', label: 'Charlas' },
  { value: 'musica', label: 'Música' }
] as const

function groupEntriesByStart(entries: FestivalScheduleEntry[]) {
  const rows = new Map<number, FestivalScheduleEntry[]>()

  for (const entry of entries) {
    const row = rows.get(entry.startMinutes) ?? []
    row.push(entry)
    rows.set(entry.startMinutes, row)
  }

  return rows
}

function formatMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function getActivityTypeBadge(type: string) {
  if (type === 'taller') return 'Taller'
  if (type === 'charla') return 'Charla'
  if (type === 'musica') return 'Música'
  return type
}

export const ActivityList = ({ actividades, isEditionPast }: ActivityListProps) => {
  const schedule = buildFestivalSchedule(actividades, isEditionPast)
  const [selectedDate, setSelectedDate] = useState(schedule.days[0]?.date ?? '')
  const [selectedType, setSelectedType] = useState<string>('all')
  const scrollRegionRef = useRef<HTMLDivElement>(null)
  const selectedDay = schedule.days.find((day) => day.date === selectedDate)
  const isVisibleType = (type: string) => selectedType === 'all' || selectedType === type
  const selectedEntries = (selectedDay?.groups.flatMap((group) => group.entries) ?? [])
    .filter((entry) => isVisibleType(entry.activity.tipo))
    .sort((a, b) => a.startMinutes - b.startMinutes || a.activityIndex - b.activityIndex || a.occurrenceIndex - b.occurrenceIndex)
  const rows = groupEntriesByStart(selectedEntries)
  const visibleDatedUnscheduled = (selectedDay?.unscheduled ?? []).filter((entry) =>
    isVisibleType(entry.activity.tipo)
  )
  const visibleUndated = schedule.unscheduled.filter((entry) =>
    isVisibleType(entry.activity.tipo)
  )

  const resetScroll = () => {
    if (scrollRegionRef.current) scrollRegionRef.current.scrollTop = 0
  }
  const selectDate = (date: string) => {
    resetScroll()
    setSelectedDate(date)
  }
  const selectType = (type: string) => {
    resetScroll()
    setSelectedType(type)
  }

  return (
    <section aria-labelledby='festival-activities-heading'>
      <div className='mb-5 flex flex-wrap items-center gap-3'>
        <h2
          id='festival-activities-heading'
          className='text-palette-primary text-4xl font-black md:text-5xl'
        >
          <span>Actividades</span>{selectedDay && ` - ${format(new Date(`${selectedDay.date}T00:00:00`), 'd', { locale: es })}`}
        </h2>

        {schedule.days.length > 0 && (
          <nav aria-label='Días del cronograma' className='flex flex-wrap gap-2'>
            {schedule.days.map(({ date }) => (
              <button
                key={date}
                type='button'
                aria-pressed={selectedDate === date}
                onClick={() => selectDate(date)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedDate === date ? 'border-palette-primary bg-palette-primary text-palette-background' : 'border-palette-primary/30 text-palette-foreground'}`}
              >
                {`${format(new Date(`${date}T00:00:00`), 'd', { locale: es })} ${format(new Date(`${date}T00:00:00`), 'MMMM', { locale: es }).replace(/^\p{Ll}/u, (letter) => letter.toLocaleUpperCase('es'))}`}
              </button>
            ))}
          </nav>
        )}

        <div role='group' aria-label='Filtrar actividades por tipo' className='ml-auto flex flex-wrap items-center gap-2'>
          {TYPE_FILTERS.map(({ value, label }) => {
            const active = selectedType === value
            return (
              <button
                key={value}
                type='button'
                aria-pressed={active}
                onClick={() => selectType(value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? 'border-palette-accent bg-palette-accent/10 text-palette-accent' : 'border-palette-foreground/25 text-palette-foreground/60'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p className='text-palette-foreground/60 mb-2 text-right text-xs'>
        Deslizá dentro del cronograma para ver más horarios
      </p>
      {/* Fixed max height approximates five closed activity rows; expanded cards and responsive wrapping make the visible count intentionally variable. */}
      <div
        ref={scrollRegionRef}
        data-schedule-scroll-region
        role='region'
        aria-label='Cronograma de actividades. Desplazate para ver más horarios.'
        tabIndex={0}
        className='max-h-[34rem] overflow-y-auto overscroll-contain p-3 pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 md:p-5'
      >
        {selectedDay && (
          <section aria-label={`Actividades del ${selectedDay.date}`}>
            <ol className="relative space-y-6 before:absolute before:bottom-0 before:left-[4.25rem] before:top-0 before:w-px before:bg-palette-primary/30 before:content-['']">
              {Array.from(rows, ([rowStart, row]) => {
                const rowEnd = Math.max(...row.map((entry) => entry.endMinutes ?? entry.startMinutes))
                const columnCount = row.length
                return (
                  <li
                    key={`${selectedDay.date}-${rowStart}`}
                    data-schedule-row
                    role='group'
                    aria-label={`${formatMinutes(rowStart)} a ${formatMinutes(rowEnd)}`}
                    data-column-count={columnCount}
                    className='relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3'
                  >
                    <div className='relative flex items-start justify-end pr-2 pt-2'>
                      <time
                        data-timeline-time
                        dateTime={formatMinutes(rowStart)}
                        className='text-palette-accent z-10 bg-palette-background px-1 font-mono text-base font-bold tabular-nums sm:text-lg'
                      >
                        {formatMinutes(rowStart)}
                      </time>
                      <span
                        data-timeline-dot
                        aria-hidden='true'
                        className='bg-palette-accent absolute left-[4.25rem] top-[0.7rem] z-10 size-2 -translate-x-1/2 rounded-full ring-4 ring-palette-background'
                      />
                    </div>
                    <div
                      className='grid min-w-0 grid-cols-1 gap-3 md:[grid-template-columns:repeat(var(--schedule-columns),minmax(0,1fr))] [&:has(details[open])]:items-start'
                      style={{ '--schedule-columns': Math.max(2, columnCount) } as CSSProperties}
                    >
                      {row.map((entry, index) => (
                        <div
                          key={`${entry.activityIndex}-${entry.occurrenceIndex}`}
                          className='flex min-w-0 md:[grid-column:var(--schedule-column)]'
                          style={{ '--schedule-column': index + 1 } as CSSProperties}
                        >
                          <ActivityItem
                            activity={{ ...entry.activity, ocurrencias: [entry.occurrence] }}
                            badge={getActivityTypeBadge(entry.activity.tipo)}
                          />
                        </div>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {visibleDatedUnscheduled.length > 0 && (
          <section aria-label='Horario por confirmar' className='mt-6 border-t border-palette-primary/20 pt-5'>
            <h3 className='text-palette-accent mb-3 font-mono text-lg font-bold'>
              Horario por confirmar
            </h3>
            <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {visibleDatedUnscheduled.map(({ activity, occurrence, activityIndex, occurrenceIndex }) => (
                <li key={`${activityIndex}-${occurrenceIndex}`}>
                  <ActivityItem
                    activity={{ ...activity, ocurrencias: occurrence ? [occurrence] : [] }}
                    badge={getActivityTypeBadge(activity.tipo)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {visibleUndated.length > 0 && (
          <section aria-label='Actividades sin fecha' className='mt-6 border-t border-palette-primary/20 pt-5'>
            <h3 className='text-palette-accent mb-3 font-mono text-lg font-bold'>
              Actividades sin fecha
            </h3>
            <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {visibleUndated.map(({ activity, occurrence, activityIndex, occurrenceIndex }) => (
                <li key={`${activityIndex}-${occurrenceIndex ?? 'none'}`}>
                  <ActivityItem
                    activity={{ ...activity, ocurrencias: occurrence ? [occurrence] : [] }}
                    badge={getActivityTypeBadge(activity.tipo)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  )
}

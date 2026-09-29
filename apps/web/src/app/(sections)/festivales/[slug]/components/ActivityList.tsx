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

function getOverlappingRows(entries: FestivalScheduleEntry[]) {
  const rows: FestivalScheduleEntry[][] = []
  let row: FestivalScheduleEntry[] = []
  let rowEnd = -1

  for (const entry of entries) {
    if (row.length > 0 && entry.startMinutes >= rowEnd) {
      rows.push(row)
      row = []
      rowEnd = -1
    }
    row.push(entry)
    rowEnd = Math.max(rowEnd, entry.endMinutes ?? entry.startMinutes)
  }

  if (row.length > 0) rows.push(row)
  return rows
}

function formatMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
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
  const rows = getOverlappingRows(selectedEntries)
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
      <h2
        id='festival-activities-heading'
        className='text-palette-primary mb-5 w-full text-center text-4xl font-bold md:text-start'
      >
        Actividades
      </h2>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
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
                {format(new Date(`${date}T00:00:00`), 'd MMM', { locale: es })}
              </button>
            ))}
          </nav>
        )}

        <div role='group' aria-label='Filtrar actividades por tipo' className='flex flex-wrap items-center gap-2'>
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
            <h3 className='text-palette-accent mb-4 font-mono text-xl font-bold'>
              {format(new Date(`${selectedDay.date}T00:00:00`), 'd MMMM yyyy', { locale: es })}
            </h3>
            <ol className="relative space-y-3 before:absolute before:bottom-0 before:left-[4.25rem] before:top-0 before:w-px before:bg-palette-primary/30 before:content-['']">
              {rows.map((row) => {
                const rowStart = Math.min(...row.map((entry) => entry.startMinutes))
                const rowEnd = Math.max(...row.map((entry) => entry.endMinutes ?? entry.startMinutes))
                const visibleColumns = [...new Set(row.map((entry) => entry.column))].sort((a, b) => a - b)
                const columnCount = visibleColumns.length
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
                        className='text-palette-accent z-10 bg-palette-background px-1 font-mono text-xs font-semibold tabular-nums sm:text-sm'
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
                      className='grid min-w-0 grid-cols-1 gap-3 md:[grid-template-columns:repeat(var(--schedule-columns),minmax(0,1fr))]'
                      style={{ '--schedule-columns': columnCount } as CSSProperties}
                    >
                      {row.map((entry) => (
                        <div
                          key={`${entry.activityIndex}-${entry.occurrenceIndex}`}
                          className='min-w-0 md:[grid-column:var(--schedule-column)]'
                          style={{ '--schedule-column': visibleColumns.indexOf(entry.column) + 1 } as CSSProperties}
                        >
                          <ActivityItem
                            activity={{ ...entry.activity, ocurrencias: [entry.occurrence] }}
                            badge={entry.activity.tipo === 'musica' ? 'Música' : undefined}
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
                    badge={activity.tipo === 'musica' ? 'Música' : undefined}
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
                    badge={activity.tipo === 'musica' ? 'Música' : undefined}
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

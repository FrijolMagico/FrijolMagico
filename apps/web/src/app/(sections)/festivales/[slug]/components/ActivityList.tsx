'use client'

import { useCallback, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { es } from 'date-fns/locale'

import { ActivityItem } from './ActivityItem'
import { buildFestivalSchedule } from '../lib/festival-schedule'

import type { FestivalScheduleEntry } from '../lib/festival-schedule'
import type { FestivalActivity } from '../../types/festival'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

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

export const ActivityList = ({
  actividades,
  isEditionPast
}: ActivityListProps) => {
  const schedule = buildFestivalSchedule(actividades, isEditionPast)
  const [selectedDate, setSelectedDate] = useState(schedule.days[0]?.date ?? '')
  const [selectedType, setSelectedType] = useState<string>('all')
  const visibleTypeFilters = TYPE_FILTERS.filter(
    ({ value }) =>
      value === 'all' || actividades.some((activity) => activity.tipo === value)
  )
  const selectedTypeIsVisible = visibleTypeFilters.some(
    ({ value }) => value === selectedType
  )
  if (selectedType !== 'all' && !selectedTypeIsVisible) {
    setSelectedType('all')
  }
  const activeType = selectedTypeIsVisible ? selectedType : 'all'
  const scrollRegionRef = useRef<HTMLDivElement>(null)
  const [hasMoreBelow, setHasMoreBelow] = useState(false)
  const updateScrollCue = useCallback(() => {
    const region = scrollRegionRef.current
    setHasMoreBelow(
      Boolean(
        region &&
        region.scrollTop + region.clientHeight < region.scrollHeight - 1
      )
    )
  }, [])
  const setScrollRegion = useCallback(
    (region: HTMLDivElement | null) => {
      scrollRegionRef.current = region
      if (!region) return

      updateScrollCue()
      if (typeof ResizeObserver === 'undefined') return

      const observer = new ResizeObserver(updateScrollCue)
      observer.observe(region)
      for (const child of region.children) observer.observe(child)
      return () => observer.disconnect()
    },
    [selectedDate, selectedType, updateScrollCue]
  )
  const selectedDay = schedule.days.find((day) => day.date === selectedDate)
  const isVisibleType = (type: string) =>
    activeType === 'all' || activeType === type
  const selectedEntries = (
    selectedDay?.groups.flatMap((group) => group.entries) ?? []
  )
    .filter((entry) => isVisibleType(entry.activity.tipo))
    .sort(
      (a, b) =>
        a.startMinutes - b.startMinutes ||
        a.activityIndex - b.activityIndex ||
        a.occurrenceIndex - b.occurrenceIndex
    )
  const rows = groupEntriesByStart(selectedEntries)
  const visibleDatedUnscheduled = (selectedDay?.unscheduled ?? []).filter(
    (entry) => isVisibleType(entry.activity.tipo)
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
    <section
      aria-labelledby='festival-activities-heading'
      className='space-y-4'
    >
      <div className='flex flex-wrap items-center gap-y-4'>
        <h2
          id='festival-activities-heading'
          className='text-palette-primary text-center text-4xl font-black md:text-start md:text-5xl'
        >
          <span>Actividades</span>
          {selectedDay && (
            <>
              {' '}
              <span className='text-palette-secondary inline-block w-[5ch] tabular-nums'>
                Día{' '}
                {format(new Date(`${selectedDay.date}T00:00:00`), 'd', {
                  locale: es
                })}
              </span>
            </>
          )}
        </h2>

        {schedule.days.length > 0 && (
          <nav
            aria-label='Días del cronograma'
            className='mx-auto flex items-center gap-2'
          >
            {schedule.days.map(({ date }) => (
              <Button
                key={date}
                type='button'
                aria-pressed={selectedDate === date}
                onClick={() => selectDate(date)}
                className={`rounded-lg outline focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedDate === date ? 'outline-palette-primary bg-palette-primary text-palette-background' : 'outline-palette-primary bg-palette-background text-palette-foreground'}`}
              >
                <>
                  <span className='text-center'>
                    {format(new Date(`${date}T00:00:00`), 'd', { locale: es })}{' '}
                    {format(new Date(`${date}T00:00:00`), 'MMMM', {
                      locale: es
                    }).replace(/^\p{Ll}/u, (letter) =>
                      letter.toLocaleUpperCase('es')
                    )}
                  </span>
                </>
              </Button>
            ))}
          </nav>
        )}

        <div
          role='group'
          aria-label='Filtrar actividades por tipo'
          className='mx-auto ml-auto flex flex-wrap items-center gap-2 md:mr-0'
        >
          {visibleTypeFilters.map(({ value, label }) => {
            const active = activeType === value
            return (
              <Button
                key={value}
                type='button'
                variant='ghost'
                aria-pressed={active}
                onClick={() => selectType(value)}
                className={`rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? 'bg-palette-secondary/10 text-palette-secondary' : 'text-palette-primary/60'}`}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Fixed max height approximates five closed activity rows; expanded cards and responsive wrapping make the visible count intentionally variable. */}
      <div className='relative'>
        <div
          aria-hidden='true'
          className='from-background pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-linear-to-b to-transparent'
        />
        <div
          aria-hidden='true'
          className='from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t to-transparent'
        />
        <div
          ref={setScrollRegion}
          onScroll={updateScrollCue}
          data-schedule-scroll-region
          role='region'
          aria-label='Cronograma de actividades. Desplazate para ver más horarios.'
          tabIndex={0}
          className='max-h-150 overflow-y-auto py-10 pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 md:p-3 md:py-14'
        >
          {selectedDay && (
            <section aria-label={`Actividades del ${selectedDay.date}`}>
              <ol className="before:bg-palette-primary/30 relative space-y-12 before:absolute before:top-0 before:bottom-0 before:left-17 before:w-px before:content-['']">
                {Array.from(rows, ([rowStart, row]) => {
                  const rowEnd = Math.max(
                    ...row.map(
                      (entry) => entry.endMinutes ?? entry.startMinutes
                    )
                  )
                  const columnCount = row.length
                  return (
                    <li
                      key={`${selectedDay.date}-${rowStart}`}
                      data-schedule-row
                      role='group'
                      aria-label={`${formatMinutes(rowStart)} a ${formatMinutes(rowEnd)}`}
                      data-column-count={columnCount}
                      className='relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2'
                    >
                      <div className='pt-2'>
                        <div className='relative flex w-full items-center justify-end gap-2'>
                          <time
                            data-timeline-time
                            dateTime={formatMinutes(rowStart)}
                            className='text-palette-primary z-10 font-mono text-lg font-bold tabular-nums sm:text-2xl'
                          >
                            {formatMinutes(rowStart)}
                          </time>
                          <span
                            data-timeline-dot
                            aria-hidden='true'
                            className='bg-palette-primary ring-background z-10 aspect-square size-2 rounded-full ring-4'
                          />
                        </div>
                      </div>
                      <div
                        className='grid min-w-0 grid-cols-1 items-start gap-x-4 gap-y-8 md:grid-cols-[repeat(var(--schedule-columns),minmax(0,1fr))]'
                        style={
                          {
                            '--schedule-columns': Math.max(2, columnCount)
                          } as CSSProperties
                        }
                      >
                        {row.map((entry, index) => (
                          <div
                            key={`${entry.activityIndex}-${entry.occurrenceIndex}`}
                            className='min-w-0 md:col-(--schedule-column)'
                            style={
                              {
                                '--schedule-column': index + 1
                              } as CSSProperties
                            }
                          >
                            <ActivityItem
                              activity={{
                                ...entry.activity,
                                ocurrencias: [entry.occurrence]
                              }}
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
            <section
              aria-label='Horario por confirmar'
              className='border-palette-primary/20 mt-6 border-t pt-5'
            >
              <h3 className='text-palette-accent mb-3 font-mono text-lg font-bold'>
                Horario por confirmar
              </h3>
              <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {visibleDatedUnscheduled.map(
                  ({
                    activity,
                    occurrence,
                    activityIndex,
                    occurrenceIndex
                  }) => (
                    <li key={`${activityIndex}-${occurrenceIndex}`}>
                      <ActivityItem
                        activity={{
                          ...activity,
                          ocurrencias: occurrence ? [occurrence] : []
                        }}
                        badge={getActivityTypeBadge(activity.tipo)}
                      />
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          {visibleUndated.length > 0 && (
            <section
              aria-label='Actividades sin fecha'
              className='border-palette-primary/20 mt-6 border-t pt-5'
            >
              <h3 className='text-palette-accent mb-3 font-mono text-lg font-bold'>
                Actividades sin fecha
              </h3>
              <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {visibleUndated.map(
                  ({
                    activity,
                    occurrence,
                    activityIndex,
                    occurrenceIndex
                  }) => (
                    <li key={`${activityIndex}-${occurrenceIndex ?? 'none'}`}>
                      <ActivityItem
                        activity={{
                          ...activity,
                          ocurrencias: occurrence ? [occurrence] : []
                        }}
                        badge={getActivityTypeBadge(activity.tipo)}
                      />
                    </li>
                  )
                )}
              </ul>
            </section>
          )}
        </div>
      </div>
      <div
        aria-hidden='true'
        className={cn(
          'text-palette-accent mt-1 flex justify-center opacity-0 transition-opacity',
          hasMoreBelow && 'opacity-100'
        )}
      >
        <ChevronDown className='size-6' />
      </div>
    </section>
  )
}

import type { FestivalActivity, FestivalActivityOccurrence } from '../../types/festival'

export interface FestivalScheduleEntry {
  activity: FestivalActivity
  occurrence: FestivalActivityOccurrence
  activityIndex: number
  occurrenceIndex: number
  startMinutes: number
  endMinutes: number | null
  column: number
}

export interface FestivalScheduleGroup {
  type: string
  entries: FestivalScheduleEntry[]
  columnCount: number
}

export interface FestivalScheduleDay {
  date: string
  groups: FestivalScheduleGroup[]
}

export interface FestivalUnscheduledEntry {
  activity: FestivalActivity
  occurrence: FestivalActivityOccurrence | null
  activityIndex: number
  occurrenceIndex: number | null
}

export interface FestivalSchedule {
  days: FestivalScheduleDay[]
  unscheduled: FestivalUnscheduledEntry[]
}

const TYPE_ORDER: Record<string, number> = {
  taller: 0,
  charla: 1,
  musica: 99
}

function parseStartMinutes(value: string | null): number | null {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function compareEntries(a: FestivalScheduleEntry, b: FestivalScheduleEntry): number {
  return (
    a.startMinutes - b.startMinutes ||
    a.activityIndex - b.activityIndex ||
    a.occurrenceIndex - b.occurrenceIndex
  )
}

function assignColumns(entries: FestivalScheduleEntry[]): number {
  const columnEnds: number[] = []

  for (const entry of entries) {
    const column = columnEnds.findIndex((end) => end <= entry.startMinutes)
    entry.column = column === -1 ? columnEnds.length : column
    const end = entry.endMinutes ?? entry.startMinutes
    if (entry.column === columnEnds.length) columnEnds.push(end)
    else columnEnds[entry.column] = end
  }

  return columnEnds.length
}

export function buildFestivalSchedule(
  activities: FestivalActivity[],
  isEditionPast: boolean
): FestivalSchedule {
  const days = new Map<string, Map<string, FestivalScheduleEntry[]>>()
  const unscheduled: FestivalUnscheduledEntry[] = []

  activities.forEach((activity, activityIndex) => {
    if (activity.ocurrencias.length === 0) {
      if (!isEditionPast) {
        unscheduled.push({ activity, occurrence: null, activityIndex, occurrenceIndex: null })
      }
      return
    }

    activity.ocurrencias.forEach((occurrence, occurrenceIndex) => {
      const startMinutes = parseStartMinutes(occurrence.hora_inicio)
      const duration = occurrence.duracion_minutos
      if (
        startMinutes === null ||
        duration === null ||
        !Number.isInteger(duration) ||
        duration <= 0 ||
        startMinutes + duration > 24 * 60
      ) {
        if (!isEditionPast) {
          unscheduled.push({ activity, occurrence, activityIndex, occurrenceIndex })
        }
        return
      }

      let types = days.get(occurrence.fecha)
      if (!types) {
        types = new Map()
        days.set(occurrence.fecha, types)
      }
      let entries = types.get(activity.tipo)
      if (!entries) {
        entries = []
        types.set(activity.tipo, entries)
      }
      entries.push({
        activity,
        occurrence,
        activityIndex,
        occurrenceIndex,
        startMinutes,
        endMinutes: startMinutes + duration,
        column: 0
      })
    })
  })

  const scheduleDays = [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, types]) => {
      const allEntries = [...types.values()].flat().sort(compareEntries)
      const columnCount = assignColumns(allEntries)

      return {
        date,
        groups: [...types.entries()]
          .sort(([a], [b]) => (TYPE_ORDER[a] ?? 99) - (TYPE_ORDER[b] ?? 99) || a.localeCompare(b))
          .map(([type, entries]) => ({
            type,
            entries: entries.sort(compareEntries),
            columnCount
          }))
      }
    })

  return { days: scheduleDays, unscheduled }
}

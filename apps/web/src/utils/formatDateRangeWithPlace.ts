import { MONTHS_ES } from '@/constants/months'

export interface DayWithPlace {
  /** ISO date string (YYYY-MM-DD). */
  fecha: string
  /** Venue name in Spanish (might be null when no venue is associated). */
  lugar?: string | null
}

function parseDateParts(fecha: string): { day: number; month: number } {
  const [, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return { day: d, month: m }
}

function formatDayList(days: number[]): string {
  if (days.length === 1) return String(days[0])
  const allButLast = days.slice(0, -1).map(String).join(', ')
  return `${allButLast} y ${days[days.length - 1]}`
}

/**
 * Format a date range with venue information for the TopBar banner.
 *
 * When all dates share the same venue:
 *   "9 y 10 de octubre, Mall VIVO Coquimbo"
 *
 * When dates have different venues:
 *   "9 de octubre, Mall VIVO y 10 de octubre, La Serena"
 */
export function formatDateRangeWithPlace(days: DayWithPlace[]): string {
  if (days.length === 0) return ''

  const sorted = [...days].sort((a, b) => a.fecha.localeCompare(b.fecha))

  const uniquePlaces = [
    ...new Set(
      sorted.map((d) => d.lugar).filter((l): l is string => Boolean(l))
    )
  ]
  const samePlace = uniquePlaces.length <= 1

  if (samePlace) {
    const parts = sorted.map((d) => parseDateParts(d.fecha))
    const groups: Array<{ month: number; days: number[] }> = []
    for (const { day, month } of parts) {
      const last = groups[groups.length - 1]
      if (last && last.month === month) {
        last.days.push(day)
      } else {
        groups.push({ month, days: [day] })
      }
    }

    const monthSegments = groups.map(
      ({ month, days }) => `${formatDayList(days)} de ${MONTHS_ES[month]}`
    )
    const datePart = monthSegments.join(' y ')
    const placePart = uniquePlaces[0]

    return placePart ? `${datePart}, ${placePart}` : datePart
  }

  return sorted
    .map((d) => {
      const { day, month } = parseDateParts(d.fecha)
      const venue = d.lugar ? `, ${d.lugar}` : ''
      return `${day} de ${MONTHS_ES[month]}${venue}`
    })
    .join(' y ')
}

const MONTHS: Record<number, string> = {
  1: 'enero',
  2: 'febrero',
  3: 'marzo',
  4: 'abril',
  5: 'mayo',
  6: 'junio',
  7: 'julio',
  8: 'agosto',
  9: 'septiembre',
  10: 'octubre',
  11: 'noviembre',
  12: 'diciembre'
}

interface DiaWithFecha {
  fecha: string
}

function parseDateParts(fecha: string): {
  day: number
  month: number
  year: number
} {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return { day: d, month: m, year: y }
}

function formatDayList(days: number[]): string {
  if (days.length === 1) return String(days[0])
  const allButLast = days.slice(0, -1).map(String).join(', ')
  return `${allButLast} y ${days[days.length - 1]}`
}

export function formatEdicionFechas(dias: DiaWithFecha[]): string {
  if (dias.length === 0) return 'Sin fechas'

  const sorted = [...dias].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  const parts = sorted.map(({ fecha }) => parseDateParts(fecha))
  const year = parts[parts.length - 1].year

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
    ({ month, days }) => `${formatDayList(days)} de ${MONTHS[month]}`
  )

  return `${monthSegments.join(' y ')} del ${year}`
}

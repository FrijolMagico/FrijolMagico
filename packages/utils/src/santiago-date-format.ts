const UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const formatter = new Intl.DateTimeFormat('es-CL', {
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
})

export function formatSantiagoDateTime(instant: string): string {
  if (!UTC_PATTERN.test(instant)) return ''
  const date = new Date(instant)
  if (Number.isNaN(date.getTime())) return ''
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  )
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`
}

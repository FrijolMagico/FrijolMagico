import { Temporal } from '@js-temporal/polyfill'

export const CHILE_TIME_ZONE = 'America/Santiago'

const UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export function parseChileLocalInstant(
  date: string,
  time: string
): Temporal.Instant {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const timeParts = /^(\d{2}):(\d{2})$/.exec(time)
  if (!dateParts || !timeParts)
    throw new Error('La fecha y hora deben ser válidas')

  return Temporal.ZonedDateTime.from(
    {
      year: Number(dateParts[1]),
      month: Number(dateParts[2]),
      day: Number(dateParts[3]),
      hour: Number(timeParts[1]),
      minute: Number(timeParts[2]),
      timeZone: CHILE_TIME_ZONE
    },
    { overflow: 'reject', disambiguation: 'reject' }
  ).toInstant()
}

export function chileLocalToUtc(date: string, time: string): string {
  try {
    return parseChileLocalInstant(date, time).toString({
      smallestUnit: 'millisecond'
    })
  } catch {
    throw new Error('La fecha y hora no existen o son ambiguas en Chile')
  }
}

export function utcToChileLocal(instant: string): {
  date: string
  time: string
} {
  if (!UTC_PATTERN.test(instant)) throw new Error('La fecha UTC no es válida')
  try {
    const zoned =
      Temporal.Instant.from(instant).toZonedDateTimeISO(CHILE_TIME_ZONE)
    return {
      date: zoned.toPlainDate().toString(),
      time: zoned.toPlainTime().toString({ smallestUnit: 'minute' })
    }
  } catch {
    throw new Error('La fecha UTC no es válida')
  }
}

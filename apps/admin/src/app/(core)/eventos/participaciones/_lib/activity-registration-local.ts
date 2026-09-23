import { Temporal } from '@js-temporal/polyfill'

export const CHILE_TIME_ZONE = 'America/Santiago'

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

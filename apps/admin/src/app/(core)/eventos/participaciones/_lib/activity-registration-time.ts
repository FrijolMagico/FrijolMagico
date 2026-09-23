import 'server-only'
import { Temporal } from '@js-temporal/polyfill'
import {
  CHILE_TIME_ZONE,
  parseChileLocalInstant
} from './activity-registration-local'

const UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

export function chileLocalToUtc(date: string, time: string): string {
  try {
    return parseChileLocalInstant(date, time).toString({
      smallestUnit: 'millisecond'
    })
  } catch {
    throw new Error('La fecha y hora no existen o son ambiguas en Chile')
  }
}

export function registrationWindowToUtc(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): { startAt: string; endAt: string } {
  const startAt = chileLocalToUtc(startDate, startTime)
  const endAt = chileLocalToUtc(endDate, endTime)
  if (Temporal.Instant.compare(endAt, startAt) <= 0) {
    throw new Error('El fin de la inscripción debe ser posterior al inicio')
  }
  return { startAt, endAt }
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

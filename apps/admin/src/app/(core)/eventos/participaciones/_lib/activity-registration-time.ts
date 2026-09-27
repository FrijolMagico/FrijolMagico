import 'server-only'
import { Temporal } from '@js-temporal/polyfill'
import {
  chileLocalToUtc,
  utcToChileLocal
} from '@frijolmagico/utils/santiago-time'

export { chileLocalToUtc, utcToChileLocal }

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

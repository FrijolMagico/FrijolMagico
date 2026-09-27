import type { ActivityRegistration } from '../../types/festival'

const CANONICAL_UTC =
  /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}Z$/

function parseInstant(value: string): number | null {
  if (!CANONICAL_UTC.test(value)) return null
  const instant = Date.parse(value)
  return Number.isFinite(instant) && new Date(instant).toISOString() === value
    ? instant
    : null
}

export function getRegistrationWindow(
  registration: ActivityRegistration | null,
  now: number
): { active: boolean; nextAt: number | null } {
  const inactive = { active: false, nextAt: null }
  if (!registration || !Number.isFinite(now)) return inactive

  try {
    const url = new URL(registration.url)
    if (url.protocol !== 'https:' || !url.hostname) return inactive
  } catch {
    return inactive
  }

  const start = parseInstant(registration.start_at)
  const end = parseInstant(registration.end_at)
  if (start === null || end === null || end <= start) return inactive
  if (now < start) return { active: false, nextAt: start }
  if (now <= end) return { active: true, nextAt: end + 1 }
  return inactive
}

import { describe, expect, test } from 'bun:test'
import { formatSantiagoDateTime } from './santiago-date-format'

describe('Santiago deadline display', () => {
  test('formats UTC instants in Spanish with zero-padded local date and minute', () => {
    expect(formatSantiagoDateTime('2026-07-01T14:30:00.000Z')).toBe(
      '01/07/2026 10:30'
    )
    expect(formatSantiagoDateTime('2026-01-01T13:05:00.000Z')).toBe(
      '01/01/2026 10:05'
    )
    expect(formatSantiagoDateTime('2026-09-06T04:30:00.000Z')).toBe(
      '06/09/2026 01:30'
    )
  })

  test('rejects invalid instants rather than displaying host-local dates', () => {
    expect(formatSantiagoDateTime('not-a-date')).toBe('')
    expect(formatSantiagoDateTime('2026-01-01T13:05:00-03:00')).toBe('')
  })
})

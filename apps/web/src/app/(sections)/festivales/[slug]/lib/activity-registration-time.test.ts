import { describe, expect, test } from 'bun:test'

import {
  formatOccurrenceTimeRange,
  getRegistrationWindow
} from './activity-registration-time'

const registration = {
  url: 'https://example.org/signup',
  start_at: '2026-09-05T16:30:00.000Z',
  end_at: '2026-09-05T17:30:00.000Z'
}
const start = Date.parse(registration.start_at)
const end = Date.parse(registration.end_at)

describe('formatOccurrenceTimeRange', () => {
  test('calculates ranges safely and rejects absent, invalid, or midnight-crossing values', () => {
    expect(formatOccurrenceTimeRange('14:00', 90)).toBe('14:00hrs a 15:30hrs')
    expect(formatOccurrenceTimeRange('23:00', 60)).toBe('23:00hrs a 24:00hrs')
    expect(formatOccurrenceTimeRange(null, null)).toBeNull()
    expect(formatOccurrenceTimeRange('23:30', 60)).toBeNull()
    expect(formatOccurrenceTimeRange('25:00', 30)).toBeNull()
  })
})

describe('getRegistrationWindow', () => {
  test('includes both boundaries and wakes just after the end', () => {
    expect(getRegistrationWindow(registration, start)).toEqual({
      active: true,
      nextAt: end + 1
    })
    expect(getRegistrationWindow(registration, end)).toEqual({
      active: true,
      nextAt: end + 1
    })
    expect(getRegistrationWindow(registration, end + 1)).toEqual({
      active: false,
      nextAt: null
    })
  })

  test('schedules the start and fails closed on missing or invalid configuration', () => {
    expect(getRegistrationWindow(registration, start - 1)).toEqual({
      active: false,
      nextAt: start
    })
    for (const input of [
      null,
      { ...registration, url: 'http://example.org' },
      { ...registration, url: 'https:///' },
      { ...registration, start_at: 'yesterday' },
      { ...registration, end_at: registration.start_at },
      { ...registration, end_at: '2026-09-05T16:00:00.000Z' },
      { ...registration, start_at: '2026-09-05T16:30:00+00:00' }
    ]) {
      expect(getRegistrationWindow(input, start)).toEqual({
        active: false,
        nextAt: null
      })
    }
  })
})

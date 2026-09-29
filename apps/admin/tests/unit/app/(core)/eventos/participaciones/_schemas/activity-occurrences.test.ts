import { describe, expect, test } from 'bun:test'
import {
  activityOccurrencesSchema,
  activityScheduleUpdate,
  parseActivityOccurrencesInput,
  sameActivitySchedule
} from '@/core/eventos/participaciones/_schemas/activity.schema'

describe('activity occurrences', () => {
  test('accepts zero sessions and multiple complete sessions on arbitrary dates', () => {
    expect(activityOccurrencesSchema.parse([])).toEqual([])
    expect(activityOccurrencesSchema.parse([
      { date: '2026-06-10', startTime: '09:00', durationMinutes: 45 },
      { date: '2026-06-10', startTime: '09:45', durationMinutes: 60 },
      { date: '2026-07-01', startTime: '23:00', durationMinutes: 60 }
    ])).toHaveLength(3)
  })

  test('preserves a persisted ID and per-occurrence URL while allowing an untimed date', () => {
    expect(activityOccurrencesSchema.parse([{
      id: 812,
      date: '2026-06-10',
      startTime: null,
      durationMinutes: null,
      url: 'https://example.org/custom'
    }])).toEqual([{
      id: 812,
      date: '2026-06-10',
      startTime: null,
      durationMinutes: null,
      url: 'https://example.org/custom'
    }])
  })

  test('compares URL content without requiring IDs and preserves reordering semantics', () => {
    const persisted = [
      { id: 7, date: '2026-06-10', startTime: '09:00', durationMinutes: 45, url: 'https://example.org/one' },
      { id: 8, date: '2026-06-11', startTime: null, durationMinutes: null, url: null }
    ]
    const legacySnapshot = [
      { date: '2026-06-11', startTime: null, durationMinutes: null, url: undefined },
      { date: '2026-06-10', startTime: '09:00', durationMinutes: 45, url: 'https://example.org/one' }
    ]
    expect(sameActivitySchedule(persisted, legacySnapshot)).toBe(true)
    expect(sameActivitySchedule(persisted, [
      { ...legacySnapshot[1]!, url: 'https://example.org/other' },
      legacySnapshot[0]!
    ])).toBe(false)
  })

  test('submits changed occurrence URLs even when the calendar schedule is unchanged', () => {
    const original = [{ id: 7, date: '2026-06-10', startTime: '09:00', durationMinutes: 45, url: 'https://example.org/old' }]
    const desired = [{ ...original[0]!, url: 'https://example.org/new' }]
    expect(activityScheduleUpdate(original, desired, false)).toEqual({
      occurrences: desired,
      expectedOccurrences: original
    })
  })

  test('accepts Chile wall hours during DST gaps and folds without requiring a UTC instant', () => {
    expect(activityOccurrencesSchema.safeParse([
      { date: '2026-09-06', startTime: '00:30', durationMinutes: 30 },
      { date: '2026-04-05', startTime: '00:30', durationMinutes: 30 },
      { date: '2026-11-28', startTime: '10:00', durationMinutes: 60 }
    ]).success).toBe(true)
  })

  test('reports impossible dates and malformed times on their own fields', () => {
    const result = activityOccurrencesSchema.safeParse([
      { date: '2026-02-30', startTime: '10:00', durationMinutes: 60 },
      { date: '2026-06-10', startTime: '24:00', durationMinutes: 60 }
    ])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: [0, 'date'], message: 'Ingresa una fecha de calendario válida' }))
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: [1, 'startTime'], message: 'Ingresa una hora válida (HH:mm)' }))
    }
  })

  for (const occurrences of [
    [{ date: '2026-02-30', startTime: '10:00', durationMinutes: 60 }],
    [{ date: '2026-06-10', startTime: '24:00', durationMinutes: 60 }],
    [{ date: '2026-06-10', startTime: '10:00', durationMinutes: 0 }],
    [{ date: '2026-06-10', startTime: '23:00', durationMinutes: 61 }],
    [{ date: '2026-06-10', startTime: '10:00', durationMinutes: 60 },
      { date: '2026-06-10', startTime: '10:30', durationMinutes: 30 }],
    [{ date: '2026-06-10', startTime: '10:00', durationMinutes: 60 },
      { date: '2026-06-10', startTime: '09:30', durationMinutes: 45 }]
  ]) {
    test(`rejects invalid or overlapping sessions: ${JSON.stringify(occurrences)}`, () => {
      expect(activityOccurrencesSchema.safeParse(occurrences).success).toBe(false)
    })
  }

  test('workshops, talks and music require a valid occurrence date', () => {
    const sessions = [{ date: '2026-06-10', startTime: '09:00', durationMinutes: 45 }]
    expect(parseActivityOccurrencesInput(sessions, 'charla')).toEqual(sessions)
    expect(parseActivityOccurrencesInput(sessions, 'musica')).toEqual(sessions)
    expect(() => parseActivityOccurrencesInput(undefined, 'musica')).toThrow('al menos una fecha')
    expect(() => parseActivityOccurrencesInput(sessions, 'teatro')).toThrow()
  })
})

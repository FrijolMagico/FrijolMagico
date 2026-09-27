import { describe, expect, test } from 'bun:test'
import {
  parseChileLocalInstant,
  chileLocalToUtc,
  utcToChileLocal
} from './santiago-time'

describe('Santiago wall-time conversion', () => {
  test('converts winter and summer with millisecond UTC serialization and round trips', () => {
    for (const [date, time, utc] of [
      ['2026-07-01', '10:30', '2026-07-01T14:30:00.000Z'],
      ['2026-01-01', '10:30', '2026-01-01T13:30:00.000Z']
    ]) {
      expect(chileLocalToUtc(date, time)).toBe(utc)
      expect(utcToChileLocal(utc)).toEqual({ date, time })
      expect(parseChileLocalInstant(date, time).toString()).toBe(
        utc.replace('.000Z', 'Z')
      )
    }
  })

  test('rejects gaps, folds, invalid and noncanonical wall times', () => {
    for (const [date, time] of [
      ['2026-09-06', '00:30'],
      ['2026-04-04', '23:30'],
      ['2026-02-30', '10:00'],
      ['2026-7-01', '10:00'],
      ['2026-01-01', '24:00'],
      ['2026-01-01', '10:00:00']
    ]) {
      expect(() => chileLocalToUtc(date, time)).toThrow()
    }
  })

  test('requires canonical UTC milliseconds for inverse conversion', () => {
    for (const instant of [
      '2026-01-01T13:30:00-03:00',
      '2026-01-01T13:30:00Z',
      'not-a-date'
    ]) {
      expect(() => utcToChileLocal(instant)).toThrow(
        'La fecha UTC no es válida'
      )
    }
  })
})

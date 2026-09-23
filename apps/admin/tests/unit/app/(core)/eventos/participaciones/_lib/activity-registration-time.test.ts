import { describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))
const { chileLocalToUtc, registrationWindowToUtc, utcToChileLocal } =
  await import('@/core/eventos/participaciones/_lib/activity-registration-time')

describe('America/Santiago registration times', () => {
  test('uses winter -04 and summer -03, serialized to UTC milliseconds', () => {
    expect(chileLocalToUtc('2026-07-01', '10:30')).toBe(
      '2026-07-01T14:30:00.000Z'
    )
    expect(chileLocalToUtc('2026-01-01', '10:30')).toBe(
      '2026-01-01T13:30:00.000Z'
    )
  })

  test('rejects DST gap and fold without picking an arbitrary offset', () => {
    expect(() => chileLocalToUtc('2026-09-06', '00:30')).toThrow()
    expect(() => chileLocalToUtc('2026-04-04', '23:30')).toThrow()
  })

  test('rejects rollover, noncanonical components and seconds', () => {
    for (const [date, time] of [
      ['2026-02-30', '10:00'],
      ['2026-7-01', '10:00'],
      ['2026-01-01', '24:00'],
      ['2026-01-01', '10:00:00'],
      ['2026-01-01', '1:00']
    ])
      expect(() => chileLocalToUtc(date, time)).toThrow()
  })

  test('orders instants rather than local clock labels', () => {
    expect(
      registrationWindowToUtc('2026-07-01', '10:00', '2026-07-01', '11:00')
    ).toEqual({
      startAt: '2026-07-01T14:00:00.000Z',
      endAt: '2026-07-01T15:00:00.000Z'
    })
    expect(() =>
      registrationWindowToUtc('2026-07-01', '10:00', '2026-07-01', '10:00')
    ).toThrow()
    expect(() =>
      registrationWindowToUtc('2026-07-02', '10:00', '2026-07-01', '10:00')
    ).toThrow()
  })

  test('converts stored UTC to Chile-local form defaults without host timezone', () => {
    expect(utcToChileLocal('2026-07-01T14:30:00.000Z')).toEqual({
      date: '2026-07-01',
      time: '10:30'
    })
    expect(utcToChileLocal('2026-01-01T13:30:00.000Z')).toEqual({
      date: '2026-01-01',
      time: '10:30'
    })
    expect(() => utcToChileLocal('2026-01-01T13:30:00-03:00')).toThrow()
  })
})

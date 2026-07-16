import { describe, expect, test } from 'bun:test'

import { formatDateRangeWithPlace } from './formatDateRangeWithPlace'
import type { DayWithPlace } from './formatDateRangeWithPlace'

describe('formatDateRangeWithPlace', () => {
  test('returns empty string for empty array', () => {
    expect(formatDateRangeWithPlace([])).toBe('')
  })

  test('formats a single day without place', () => {
    const days: DayWithPlace[] = [{ fecha: '2026-10-09', lugar: null }]
    expect(formatDateRangeWithPlace(days)).toBe('9 de octubre')
  })

  test('formats a single day with place', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' }
    ]
    expect(formatDateRangeWithPlace(days)).toBe(
      '9 de octubre, Mall VIVO Coquimbo'
    )
  })

  test('formats two days same month, same place', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' },
      { fecha: '2026-10-10', lugar: 'Mall VIVO Coquimbo' }
    ]
    expect(formatDateRangeWithPlace(days)).toBe(
      '9 y 10 de octubre, Mall VIVO Coquimbo'
    )
  })

  test('formats two days same month, no place', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-09', lugar: null },
      { fecha: '2026-10-10', lugar: null }
    ]
    expect(formatDateRangeWithPlace(days)).toBe('9 y 10 de octubre')
  })

  test('formats two days different months, same place', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' },
      { fecha: '2026-11-10', lugar: 'Mall VIVO Coquimbo' }
    ]
    expect(formatDateRangeWithPlace(days)).toBe(
      '9 de octubre y 10 de noviembre, Mall VIVO Coquimbo'
    )
  })

  test('formats two days with different places', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-09', lugar: 'Mall VIVO Coquimbo' },
      { fecha: '2026-10-10', lugar: 'La Serena' }
    ]
    expect(formatDateRangeWithPlace(days)).toBe(
      '9 de octubre, Mall VIVO Coquimbo y 10 de octubre, La Serena'
    )
  })

  test('formats three days same month, same place', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-09', lugar: 'Teatro Municipal' },
      { fecha: '2026-10-10', lugar: 'Teatro Municipal' },
      { fecha: '2026-10-11', lugar: 'Teatro Municipal' }
    ]
    expect(formatDateRangeWithPlace(days)).toBe(
      '9, 10 y 11 de octubre, Teatro Municipal'
    )
  })

  test('sorts days by date regardless of input order', () => {
    const days: DayWithPlace[] = [
      { fecha: '2026-10-10', lugar: null },
      { fecha: '2026-10-09', lugar: null }
    ]
    expect(formatDateRangeWithPlace(days)).toBe('9 y 10 de octubre')
  })
})

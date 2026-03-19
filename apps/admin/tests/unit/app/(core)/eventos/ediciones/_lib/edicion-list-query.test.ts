import { describe, expect, test } from 'bun:test'
import { normalizeEdicionListQuery } from '@/core/eventos/ediciones/_lib/edicion-list-query'

describe('normalizeEdicionListQuery', () => {
  test('normalizes event edition query params', () => {
    const result = normalizeEdicionListQuery({
      page: 4,
      pageSize: 20,
      search: '  verano ',
      filters: {
        eventoId: '12'
      }
    })

    expect(result).toEqual({
      page: 4,
      pageSize: 20,
      search: 'verano',
      eventoId: '12'
    })
  })

  test('falls back to null event filter when the value is blank', () => {
    const result = normalizeEdicionListQuery({
      page: 1,
      pageSize: 20,
      search: '  invierno ',
      filters: {
        eventoId: ' '
      }
    })

    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      search: 'invierno',
      eventoId: null
    })
  })
})

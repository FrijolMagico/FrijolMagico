import { describe, expect, test } from 'bun:test'
import { bandQueryParamsSchema } from '@/core/artistas/bandas/_schemas/query-params.schema'

describe('bandQueryParamsSchema', () => {
  test('provides defaults when values are omitted', () => {
    const result = bandQueryParamsSchema.parse({})

    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      mostrar_eliminados: false
    })
  })

  test('accepts typed values from nuqs parsing', () => {
    const result = bandQueryParamsSchema.parse({
      page: 3,
      pageSize: 10,
      mostrar_eliminados: true
    })

    expect(result).toEqual({
      page: 3,
      pageSize: 10,
      mostrar_eliminados: true
    })
  })

  test('ignores the legacy showDeleted key by omission', () => {
    const result = bandQueryParamsSchema.parse({
      page: 2,
      pageSize: 10,
      showDeleted: true
    })

    expect(result).toEqual({
      page: 2,
      pageSize: 10,
      mostrar_eliminados: false
    })
  })

  test('rejects invalid page size values', () => {
    expect(() =>
      bandQueryParamsSchema.parse({
        page: 1,
        pageSize: 0,
        mostrar_eliminados: false
      })
    ).toThrow()
  })
})

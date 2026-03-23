import { describe, expect, test } from 'bun:test'

import { artistQueryParamsSchema } from '@/core/artistas/_schemas/query-params.schema'

describe('artistQueryParamsSchema', () => {
  test('defaults mostrar_eliminados to false when omitted', () => {
    const result = artistQueryParamsSchema.parse({
      page: 1,
      limit: 20,
      search: '',
      pais: null,
      ciudad: null,
      estado: null
    })

    expect(result.mostrar_eliminados).toBe(false)
  })

  test('accepts mostrar_eliminados=true after nuqs parsing', () => {
    const result = artistQueryParamsSchema.parse({
      page: 1,
      limit: 20,
      search: '',
      mostrar_eliminados: true,
      pais: null,
      ciudad: null,
      estado: null
    })

    expect(result.mostrar_eliminados).toBe(true)
  })
})

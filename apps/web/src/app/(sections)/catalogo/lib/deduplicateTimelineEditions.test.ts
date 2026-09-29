import { describe, expect, test } from 'bun:test'

import { deduplicateTimelineEditions } from './deduplicateTimelineEditions'

const participation = (
  overrides: Partial<{
    evento_id: number
    edicion: string
    evento: string
    año: string | null
    tipo_participacion: 'exhibicion' | 'actividad'
    categoria: string
    via_agrupacion: string | null
  }> = {}
) => ({
  evento_id: 1,
  edicion: '10',
  evento: 'Festival',
  año: '2024',
  tipo_participacion: 'exhibicion' as const,
  categoria: 'ilustracion',
  via_agrupacion: null,
  ...overrides
})

describe('deduplicateTimelineEditions', () => {
  test('deduplicates an event edition across participation kinds, categories, and paths', () => {
    const direct = participation()
    const deduplicated = deduplicateTimelineEditions([
      direct,
      participation({ categoria: 'narrativa-grafica' }),
      participation({ tipo_participacion: 'actividad', categoria: 'workshop' }),
      participation({ via_agrupacion: 'Colectivo' })
    ])

    expect(deduplicated).toEqual([direct])
  })

  test('retains distinct event, edition, and year entries', () => {
    const entries = [
      participation(),
      participation({ edicion: '9' }),
      participation({ año: '2023' }),
      participation({ evento_id: 2, evento: 'Otro Festival' })
    ]

    expect(deduplicateTimelineEditions(entries)).toEqual(entries)
  })
})

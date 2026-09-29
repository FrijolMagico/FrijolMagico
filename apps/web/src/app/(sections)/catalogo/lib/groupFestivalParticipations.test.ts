import { describe, expect, test } from 'bun:test'

import { groupFestivalParticipations } from './groupFestivalParticipations'

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

describe('groupFestivalParticipations', () => {
  test('groups by festival, participation kind, and category while retaining edition badges', () => {
    const groups = groupFestivalParticipations([
      participation(),
      participation({ categoria: 'narrativa-grafica' }),
      participation({ tipo_participacion: 'actividad', categoria: 'workshop' }),
      participation({ tipo_participacion: 'actividad', categoria: 'talk' }),
      participation({ edicion: '9', año: '2023' })
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0]?.categories.map(({ tipo_participacion, label }) => [
      tipo_participacion,
      label
    ])).toEqual([
      ['exhibicion', 'Ilustración'],
      ['exhibicion', 'Narrativa Gráfica'],
      ['actividad', 'Workshop'],
      ['actividad', 'Talk']
    ])
    expect(groups[0]?.categories[0]?.editions.map(({ edicion }) => edicion)).toEqual([
      '10',
      '9'
    ])
  })

  test('deduplicates a category edition arriving through direct and collective paths', () => {
    const groups = groupFestivalParticipations([
      participation(),
      participation({ via_agrupacion: 'Colectivo' })
    ])

    expect(groups[0]?.categories).toHaveLength(1)
    expect(groups[0]?.categories[0]?.editions).toHaveLength(1)
    expect(groups[0]?.categories[0]?.editions[0]?.via_agrupacion).toBeNull()
  })

  test('keeps exhibition and activity namespaces distinct when category slugs match', () => {
    const groups = groupFestivalParticipations([
      participation({ categoria: 'ilustracion' }),
      participation({ tipo_participacion: 'actividad', categoria: 'ilustracion' })
    ])

    expect(groups[0]?.categories).toHaveLength(2)
    expect(groups[0]?.categories.map(({ tipo_participacion }) => tipo_participacion)).toEqual([
      'exhibicion',
      'actividad'
    ])
  })
})

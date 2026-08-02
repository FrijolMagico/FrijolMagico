import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { notFound } from 'next/navigation'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import { getFestivalBySlug } from './getFestivalBySlug'

mock.module('next/navigation', () => ({
  notFound: mock(() => {
    throw new Error('NOT_FOUND')
  })
}))

mock.module('next/cache', () => ({
  cacheTag: mock(() => {})
}))

mock.module('@/infra/config/dataSourceConfig', () => ({
  getDataSource: () => 'local',
  isMockMode: () => false
}))

beforeEach(() => {
  executeQueryMock.mockReset()
})

const baseRawResult = {
  resultado: JSON.stringify({
    edition_id: 10,
    slug: 'edicion-15-1',
    evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
    edicion_nombre: 'Un Nuevo Germinar',
    numero_edicion: 'XV',
    poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
    dias: [],
    participantes: [],
    actividades: []
  })
}

describe('getFestivalBySlug', () => {
  test('returns detail when repository finds a festival', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [baseRawResult],
      error: null
    })

    const result = await getFestivalBySlug('edicion-15-1')

    expect(result.slug).toBe('edicion-15-1')
  })

  test('calls notFound when repository returns null', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    await expect(getFestivalBySlug('edicion-999-999')).rejects.toThrow(
      'NOT_FOUND'
    )
    expect(notFound).toHaveBeenCalled()
  })
})

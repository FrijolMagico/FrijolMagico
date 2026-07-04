import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import { festivalDetailRepository } from './festivalDetailRepository'

beforeEach(() => {
  executeQueryMock.mockReset()
})

const baseRawResult = {
  resultado: JSON.stringify({
    edition_id: 10,
    slug: 'edicion-15-1',
    evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
    edicion_nombre: 'Edición XV',
    numero_edicion: 'XV',
    poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
    dias: [],
    participantes: [
      {
        pseudonimo: 'Artista Ejemplo',
        disciplina_slug: 'ilustracion',
        catalogo_slug: 'artista-ejemplo'
      }
    ],
    actividades: []
  })
}

describe('festivalDetailRepository', () => {
  test('returns null when slug is empty', async () => {
    const result = await festivalDetailRepository('')

    expect(result).toBeNull()
    expect(executeQueryMock).not.toHaveBeenCalled()
  })

  test('returns mapped detail when query returns a row', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [baseRawResult],
      error: null
    })

    const result = await festivalDetailRepository('edicion-15-1')

    expect(result).not.toBeNull()
    expect(result?.slug).toBe('edicion-15-1')
    expect(result?.participantes[0].disciplina_slug).toBe('Ilustración')
  })

  test('returns null when no rows match', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const result = await festivalDetailRepository('edicion-999-999')

    expect(result).toBeNull()
  })

  test('returns null and logs error when query fails', async () => {
    const consoleSpy = mock((..._args: unknown[]) => {})
    globalThis.console.warn = consoleSpy

    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('DB error')
    })

    const result = await festivalDetailRepository('edicion-15-1')

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })
})

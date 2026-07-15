import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import { festivalesRepository } from './festivalesRepository'

beforeEach(() => {
  executeQueryMock.mockReset()
})

describe('festivalesRepository', () => {
  test('returns mapped festivals when query succeeds', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [
        {
          resultado: JSON.stringify({
            evento: {
              evento_id: 1,
              nombre: 'Festival Frijol Mágico',
              slug: 'frijol-magico',
              edicion: 'XVI',
              edicion_nombre: 'Un Nuevo Germinar',
              edicion_slug: 'edicion-16-1',
              poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
              dias: []
            },
            resumen: {
              total_participantes: { exponentes: 5, talleres: 3, musica: 2 },
              por_disciplina: {}
            }
          })
        }
      ],
      error: null
    })

    const result = await festivalesRepository()

    expect(result).toHaveLength(1)
    expect(result[0].evento.edicion_slug).toBe('edicion-16-1')
  })

  test('returns empty array when query returns no rows (no mock fallback)', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const result = await festivalesRepository()

    expect(result).toEqual([])
  })

  test('returns empty array when query fails (no mock fallback)', async () => {
    const consoleSpy = mock(() => {})
    globalThis.console.warn = consoleSpy

    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('DB connection failed')
    })

    const result = await festivalesRepository()

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })


})

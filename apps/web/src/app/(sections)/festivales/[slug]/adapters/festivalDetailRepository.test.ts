import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { executeQueryMock } from '@/test-utils/mockDatabase'

const getDataSourceMock = mock(() => 'database' as 'database' | 'mock')
const isMockModeMock = mock(() => false)

mock.module('@/infra/config/dataSourceConfig', () => ({
  getDataSource: getDataSourceMock,
  isMockMode: isMockModeMock
}))

import { ActivityList } from '../components/ActivityList'
import { festivalDetailRepository } from './festivalDetailRepository'

beforeEach(() => {
  executeQueryMock.mockReset()
  getDataSourceMock.mockReturnValue('database')
})

const baseRawResult = {
  resultado: JSON.stringify({
    edition_id: 10,
    slug: 'edicion-15-1',
    evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
    edicion_nombre: 'Edición XV',
    numero_edicion: 'XV',
    poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
    edicion_fin: '2025-10-03',
    is_edition_past: true,
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

  test('returns mock detail only when mock source is selected', async () => {
    getDataSourceMock.mockReturnValue('mock')

    const result = await festivalDetailRepository('edicion-xv-1')

    expect(result?.slug).toBe('edicion-xv-1')
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

  test('serializes configured, absent, and music activities without time filtering', async () => {
    const registration = {
      url: 'https://example.org/inscripcion',
      start_at: '2020-01-01T00:00:00.000Z',
      end_at: '2020-01-02T00:00:00.000Z'
    }
    const activity = {
      titulo: 'Taller',
      descripcion: null,
      ubicacion: null,
      ocurrencias: [],
      tipo: 'taller',
      participante_pseudonimo: 'Tallerista'
    }
    const payload = JSON.parse(baseRawResult.resultado)
    payload.actividades = [
      { ...activity, registration },
      { ...activity, titulo: 'Sin inscripción', registration: null },
      {
        ...activity,
        titulo: 'Concierto reservado',
        tipo: 'musica',
        participante_pseudonimo: 'Músico',
        registration: null
      }
    ]
    executeQueryMock.mockResolvedValueOnce({
      data: [{ resultado: JSON.stringify(payload) }],
      error: null
    })

    const result = await festivalDetailRepository('edicion-15-1')

    expect(result?.actividades.map(({ registration }) => registration)).toEqual(
      [registration, null, null]
    )
    expect(result?.actividades[1].ocurrencias).toEqual([])
    expect(result?.actividades[2]).toMatchObject({
      tipo: 'musica',
      participante_pseudonimo: 'Músico',
      ocurrencias: []
    })
    const html = renderToStaticMarkup(
      createElement(ActivityList, { actividades: result?.actividades ?? [], isEditionPast: false })
    )
    expect(html).not.toContain('Músico')
    expect(html).not.toContain('Concierto reservado')
    expect(html).not.toContain('Inscríbete')
  })

  test('returns null when no rows match', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: null
    })

    const result = await festivalDetailRepository('edicion-xv-1')

    expect(result).toBeNull()
  })

  test('returns null and logs error when query fails', async () => {
    const consoleSpy = mock(() => {})
    globalThis.console.warn = consoleSpy

    executeQueryMock.mockResolvedValueOnce({
      data: [],
      error: new Error('DB error')
    })

    const result = await festivalDetailRepository('edicion-xv-1')

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  test('returns null for malformed query payloads', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [{ resultado: '{invalid json' }],
      error: null
    })

    const result = await festivalDetailRepository('edicion-15-1')

    expect(result).toBeNull()
  })

  test('returns null when mapping an incomplete payload fails', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [{ resultado: JSON.stringify({ slug: 'edicion-15-1' }) }],
      error: null
    })

    const result = await festivalDetailRepository('edicion-15-1')

    expect(result).toBeNull()
  })
})

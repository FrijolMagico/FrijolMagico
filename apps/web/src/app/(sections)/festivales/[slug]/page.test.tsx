import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { notFound } from 'next/navigation'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import FestivalDetailPage, {
  generateMetadata,
  generateStaticParams
} from './page'

mock.module('next/navigation', () => ({
  notFound: mock(() => {
    throw new Error('NOT_FOUND')
  })
}))

mock.module('next/cache', () => ({
  cacheTag: mock(() => {})
}))

beforeEach(() => {
  executeQueryMock.mockReset()
})

const buildSlugRow = (slug: string) => ({ slug })

const buildDetailRow = (detail: Record<string, unknown>) => ({
  resultado: JSON.stringify(detail)
})

const baseDetail = {
  edition_id: 10,
  slug: 'edicion-15-1',
  evento: { nombre: 'Festival Frijol Mágico', slug: 'frijol-magico' },
  edicion_nombre: 'Un Nuevo Germinar',
  numero_edicion: 'XV',
  poster_url: 'https://cdn.frijolmagico.cl/poster.webp',
  dias: [],
  participantes: [],
  actividades: []
}

describe('FestivalDetailPage', () => {
  test('generateStaticParams returns slugs wrapped in params', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [
        buildSlugRow('edicion-15-1'),
        buildSlugRow('edicion-14-1')
      ],
      error: null
    })

    const params = await generateStaticParams()

    expect(params).toEqual([
      { slug: 'edicion-15-1' },
      { slug: 'edicion-14-1' }
    ])
  })

  test('generateMetadata builds title and OG image from detail', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [buildDetailRow(baseDetail)],
      error: null
    })

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'edicion-15-1' })
    })

    expect(metadata.title).toBe(
      'Un Nuevo Germinar - Festival Frijol Mágico | Frijol Mágico'
    )
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://cdn.frijolmagico.cl/poster.webp' }
    ])
  })

  test('generateMetadata handles missing poster', async () => {
    executeQueryMock.mockResolvedValueOnce({
      data: [buildDetailRow({ ...baseDetail, poster_url: null })],
      error: null
    })

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'edicion-15-1' })
    })

    expect(metadata.title).toContain('Festival Frijol Mágico')
    expect(metadata.openGraph?.images).toEqual([])
  })

  test('page calls notFound when slug is missing', async () => {
    await expect(
      FestivalDetailPage({ params: Promise.resolve({ slug: '' }) })
    ).rejects.toThrow('NOT_FOUND')
    expect(notFound).toHaveBeenCalled()
  })
})

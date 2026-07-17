import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Suspense } from 'react'

import { notFound } from 'next/navigation'

import { executeQueryMock } from '@/test-utils/mockDatabase'

import { ActiveFestivalDetailAnimation } from './components/active-animation/active-festival-detail-animation'
import { FestivalDetailContent } from './components/FestivalDetailContent'
import { FestivalNavigator } from './components/FestivalNavigator'
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
      data: [buildSlugRow('edicion-15-1'), buildSlugRow('edicion-14-1')],
      error: null
    })

    const params = await generateStaticParams()

    expect(params).toEqual([{ slug: 'edicion-15-1' }, { slug: 'edicion-14-1' }])
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
      'Festival Frijol Mágico XV | Asociación Cultural Frijol Mágico'
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

  test('composes the server navigator Suspense slot inside active detail content', async () => {
    executeQueryMock
      .mockResolvedValueOnce({
        data: [buildDetailRow(baseDetail)],
        error: null
      })
      .mockResolvedValueOnce({ data: [{ slug: baseDetail.slug }], error: null })

    const page = await FestivalDetailPage({
      params: Promise.resolve({ slug: baseDetail.slug })
    })
    const mainChildren = page.props.children as unknown as Array<{
      type: unknown
      props: { children?: unknown }
    }>

    expect(mainChildren[1].type).toBe('main')

    const animation = mainChildren[1].props.children as {
      type: unknown
      props: { children: unknown }
    }

    expect(animation.type).toBe(ActiveFestivalDetailAnimation)

    const content = animation.props.children as {
      type: unknown
      props: {
        navigator: { type: unknown; props: { children: { type: unknown } } }
      }
    }

    expect(content.type).toBe(FestivalDetailContent)

    const navigator = content.props.navigator
    expect(navigator.type).toBe(Suspense)
    expect(navigator.props.children.type).toBe(FestivalNavigator)
  })

  test('does not import FestivalNavigator from client modules', async () => {
    const clientModules = await Promise.all(
      [
        './components/active-animation/active-festival-detail-animation.tsx',
        './components/active-animation/festival-spoiler-toggle.tsx'
      ].map((path) => Bun.file(new URL(path, import.meta.url)).text())
    )

    clientModules.forEach((clientModule) => {
      expect(clientModule).not.toContain('FestivalNavigator')
    })
  })

  test.each([
    ['mismatch', [{ slug: 'other-edition' }]],
    ['empty', []],
    ['partial', [{}]]
  ])('keeps %s active lookup results static', async (_, activeData) => {
    executeQueryMock
      .mockResolvedValueOnce({
        data: [buildDetailRow(baseDetail)],
        error: null
      })
      .mockResolvedValueOnce({ data: activeData, error: null })

    const page = await FestivalDetailPage({
      params: Promise.resolve({ slug: baseDetail.slug })
    })
    const mainChildren = page.props.children as unknown as Array<{
      type: unknown
      props: { children?: unknown }
    }>

    const children = mainChildren[1].props.children as {
      type: unknown
    }

    expect(mainChildren[1].type).toBe('main')

    expect(children.type).toBe(FestivalDetailContent)
  })

  test('keeps a thrown active lookup static', async () => {
    executeQueryMock
      .mockResolvedValueOnce({
        data: [buildDetailRow(baseDetail)],
        error: null
      })
      .mockRejectedValueOnce(new Error('active lookup failed'))

    const page = await FestivalDetailPage({
      params: Promise.resolve({ slug: baseDetail.slug })
    })
    const mainChildren = page.props.children as unknown as Array<{
      type: unknown
      props: { children?: unknown }
    }>
    const child = mainChildren[1].props.children as { type: unknown }

    expect(mainChildren[1].type).toBe('main')
    expect(child.type).toBe(FestivalDetailContent)
  })
})

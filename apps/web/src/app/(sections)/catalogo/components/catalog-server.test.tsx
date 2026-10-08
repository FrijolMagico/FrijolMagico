import { afterEach, describe, expect, mock, test } from 'bun:test'
import { isValidElement } from 'react'

import type { CatalogArtist } from '../types/catalog'

const catalogRepositoryMock = mock(async (): Promise<CatalogArtist[]> => [])
const fullArtist: CatalogArtist = {
  id: 'artist-1',
  name: 'Canela',
  slug: 'canela',
  email: 'canela@example.com',
  rrss: 'https://instagram.com/canela',
  city: 'Santiago',
  country: 'Chile',
  bio: 'Full artist biography',
  orden: '1',
  destacado: false,
  avatar: '/canela.png',
  category: 'Música',
  collective: null,
  editions: []
}
const CatalogSearchSection = () => null
const CatalogList = () => null
const CatalogPanel = () => null
const ErrorSection = () => null

mock.module('./CatalogSearchSection', () => ({ CatalogSearchSection }))
mock.module('./CatalogList', () => ({ CatalogList }))
mock.module('./CatalogPanel', () => ({ CatalogPanel }))
mock.module('@/components/ErrorSection', () => ({ ErrorSection }))
mock.module('../adapters/catalogRepository', () => ({
  catalogRepository: catalogRepositoryMock
}))

const [
  { CatalogSearchServer },
  { CatalogListServer },
  { CatalogPanelServer }
] = await Promise.all([
  import('./catalog-search-server'),
  import('./catalog-list-server'),
  import('./catalog-panel-server')
])

afterEach(() => {
  catalogRepositoryMock.mockReset()
  catalogRepositoryMock.mockResolvedValue([])
})

describe('catalog server boundaries', () => {
  test('delivers search options, compact list data, and full panel details', async () => {
    catalogRepositoryMock.mockResolvedValue([fullArtist])
    const [search, list, panel] = await Promise.all([
      CatalogSearchServer(),
      CatalogListServer(),
      CatalogPanelServer()
    ])

    expect(isValidElement(search)).toBe(true)
    expect(isValidElement(list)).toBe(true)
    expect(isValidElement(panel)).toBe(true)
    expect((search as React.ReactElement<{ filterOptions: unknown }>).props.filterOptions).toEqual({
      city: [{ value: 'Santiago' }],
      country: [{ value: 'Chile' }],
      category: [{ value: 'Música' }]
    })
    const listData = (list as React.ReactElement<{ catalog: CatalogArtist[] }>).props.catalog
    expect(listData[0]).not.toHaveProperty('bio')
    const panelData = (panel as React.ReactElement<{ catalogData: CatalogArtist[] }>).props.catalogData
    expect(panelData[0]).toMatchObject({
      bio: 'Full artist biography',
      editions: [],
      collective: null
    })
  })

  test('renders an ordinary data error once in list and suppresses search and panel', async () => {
    const originalError = console.error
    console.error = mock(() => {})
    catalogRepositoryMock.mockRejectedValue(new Error('query unavailable'))

    try {
      const [search, list, panel] = await Promise.all([
        CatalogSearchServer(),
        CatalogListServer(),
        CatalogPanelServer()
      ])

      expect(search).toBeNull()
      expect(panel).toBeNull()
      expect(isValidElement(list)).toBe(true)
      expect((list as React.ReactElement).type).toBe(ErrorSection)
      expect((list as React.ReactElement<{ error: string }>).props.error).toContain('Error al obtener los artistas')
    } finally {
      console.error = originalError
    }
  })
})

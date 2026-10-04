import { describe, expect, it } from 'bun:test'
import { filterCatalog, getFiltersData } from './filterUtils'

import type { CatalogListArtist } from '../types/catalog-payloads'

const artists: CatalogListArtist[] = [
  {
    id: '1',
    name: 'Artista Norte',
    slug: 'artista-norte',
    avatar: '/norte.png',
    city: 'Santiago',
    country: 'Chile',
    category: 'Música',
    collective: 'Colectivo Sol',
    email: 'norte@example.com',
    rrss: 'https://instagram.com/norte'
  },
  {
    id: '2',
    name: 'Artista Sur',
    slug: 'artista-sur',
    avatar: '/sur.png',
    city: 'Valparaíso',
    country: 'Chile',
    category: 'Artes visuales',
    collective: null,
    email: 'sur@example.com',
    rrss: 'https://instagram.com/sur'
  }
]

describe('catalog filter utilities with compact list data', () => {
  it('preserves sorted unique nonempty option values', () => {
    expect(getFiltersData(artists, 'city')).toEqual([
      { value: 'Santiago' },
      { value: 'Valparaíso' }
    ])
    expect(getFiltersData(artists, 'country')).toEqual([{ value: 'Chile' }])
  })

  it('matches normalized artist and collective search plus selected filters', () => {
    expect(
      filterCatalog(artists, {
        search: 'COLECTIVO sol',
        city: ['santiago'],
        country: ['CHILE'],
        category: ['musica']
      }).map((artist) => artist.id)
    ).toEqual(['1'])
    expect(
      filterCatalog(artists, {
        search: 'artista',
        city: ['Santiago'],
        country: [],
        category: []
      }).map((artist) => artist.id)
    ).toEqual(['1'])
  })
})

import { describe, expect, it } from 'bun:test'
import { CatalogArtist } from '../types/catalog'
import {
  projectCatalogList,
  projectCatalogSearchOptions
} from './catalog-payloads'
import { filterCatalog } from '../utils/filterUtils'

const catalog = [
  {
    id: '2',
    name: 'Artista Dos',
    slug: 'artista-dos',
    email: 'dos@example.com',
    rrss: 'https://instagram.com/dos',
    city: 'Valparaíso',
    country: 'Chile',
    bio: 'Biography to exclude',
    orden: '2',
    destacado: false,
    avatar: '/dos.png',
    category: 'Música',
    collective: 'Colectivo Uno',
    editions: []
  },
  {
    id: '1',
    name: 'Artista Uno',
    slug: 'artista-uno',
    email: 'uno@example.com',
    rrss: 'https://instagram.com/uno',
    city: 'Santiago',
    country: 'Chile',
    bio: 'Another biography',
    orden: '1',
    destacado: true,
    avatar: '/uno.png',
    category: 'Artes visuales',
    collective: null,
    editions: []
  },
  {
    id: '3',
    name: 'Artista Tres',
    slug: 'artista-tres',
    email: 'tres@example.com',
    rrss: 'https://instagram.com/tres',
    city: 'Santiago',
    country: 'Argentina',
    bio: '',
    orden: '3',
    destacado: false,
    avatar: '/tres.png',
    category: null,
    collective: null,
    editions: []
  }
] satisfies CatalogArtist[]

const expectedListKeys = [
  'avatar',
  'category',
  'city',
  'collective',
  'country',
  'email',
  'id',
  'name',
  'rrss',
  'slug'
].sort()

describe('catalog payload projections', () => {
  it('projects only the explicit compact list fields while preserving order and values', () => {
    const projected = projectCatalogList(catalog)

    expect(projected.map((artist) => Object.keys(artist).sort())).toEqual(
      catalog.map(() => expectedListKeys)
    )
    expect(projected).toEqual([
      {
        id: '2',
        name: 'Artista Dos',
        slug: 'artista-dos',
        avatar: '/dos.png',
        city: 'Valparaíso',
        country: 'Chile',
        category: 'Música',
        collective: 'Colectivo Uno',
        email: 'dos@example.com',
        rrss: 'https://instagram.com/dos'
      },
      {
        id: '1',
        name: 'Artista Uno',
        slug: 'artista-uno',
        avatar: '/uno.png',
        city: 'Santiago',
        country: 'Chile',
        category: 'Artes visuales',
        collective: null,
        email: 'uno@example.com',
        rrss: 'https://instagram.com/uno'
      },
      {
        id: '3',
        name: 'Artista Tres',
        slug: 'artista-tres',
        avatar: '/tres.png',
        city: 'Santiago',
        country: 'Argentina',
        category: null,
        collective: null,
        email: 'tres@example.com',
        rrss: 'https://instagram.com/tres'
      }
    ])
    expect(
      filterCatalog(projected, {
        search: 'colectivo uno',
        city: ['valparaíso'],
        country: ['chile'],
        category: ['música']
      }).map((artist) => artist.id)
    ).toEqual(['2'])
  })

  it('derives sorted unique nonempty search options with current filter semantics', () => {
    expect(projectCatalogSearchOptions(catalog)).toEqual({
      city: [{ value: 'Santiago' }, { value: 'Valparaíso' }],
      country: [{ value: 'Argentina' }, { value: 'Chile' }],
      category: [{ value: 'Artes visuales' }, { value: 'Música' }]
    })
  })
})

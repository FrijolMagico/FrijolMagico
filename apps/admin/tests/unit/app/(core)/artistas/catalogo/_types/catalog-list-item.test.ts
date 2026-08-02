import { describe, expect, test } from 'bun:test'

import type { CatalogAvailableArtist } from '@/core/artistas/catalogo/_types/catalog-list-item'

describe('CatalogAvailableArtist', () => {
  test('contains identity fields and the avatar path slug', () => {
    const artist: CatalogAvailableArtist = {
      id: 1,
      pseudonimo: 'Test Artist',
      nombre: 'Test Name',
      slug: 'test-artist'
    }

    expect(artist).toEqual({
      id: 1,
      pseudonimo: 'Test Artist',
      nombre: 'Test Name',
      slug: 'test-artist'
    })
  })
})

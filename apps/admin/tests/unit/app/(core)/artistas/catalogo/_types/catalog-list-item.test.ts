import { describe, expect, test } from 'bun:test'

import type { CatalogAvailableArtist } from '@/core/artistas/catalogo/_types/catalog-list-item'

describe('CatalogAvailableArtist', () => {
  test('pairs each active pseudonym with its owning artist ID', () => {
    const option: CatalogAvailableArtist = {
      id: 1,
      pseudonimoId: 11,
      pseudonimo: 'Test Artist',
      nombre: 'Test Name',
      slug: 'test-artist'
    }

    expect(option).toMatchObject({ id: 1, pseudonimoId: 11 })
  })
})

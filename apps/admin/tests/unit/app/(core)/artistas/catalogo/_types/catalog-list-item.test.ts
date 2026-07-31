import { describe, expect, test } from 'bun:test'

import type { CatalogAvailableArtist } from '@/core/artistas/catalogo/_types/catalog-list-item'

describe('CatalogAvailableArtist', () => {
  test('avatarUrl is a nullable string property', () => {
    const artist: CatalogAvailableArtist = {
      id: 1,
      pseudonimo: 'Test Artist',
      nombre: 'Test Name',
      avatarUrl: null
    }

    // avatarUrl should be null when not set
    expect(artist.avatarUrl).toBeNull()

    // avatarUrl should accept a string value
    const artistWithAvatar: CatalogAvailableArtist = {
      id: 2,
      pseudonimo: 'Avatar Artist',
      nombre: null,
      avatarUrl: 'avatars/test.png'
    }

    expect(artistWithAvatar.avatarUrl).toBe('avatars/test.png')
  })
})

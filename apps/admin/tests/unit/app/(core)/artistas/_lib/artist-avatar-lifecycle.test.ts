import { describe, expect, test } from 'bun:test'

import {
  createArtistAvatarKey,
  parseArtistAvatarUpload,
  requireEligibleArtist
} from '@/core/artistas/_lib/artist-avatar-lifecycle'

describe('artist avatar lifecycle', () => {
  test('ignores a stale client slug and creates a canonical UUID object key', () => {
    const upload = parseArtistAvatarUpload({
      artistId: 12,
      slug: 'stale-client-slug',
      blob: new Blob(['prepared'], { type: 'image/webp' }),
      width: 800,
      height: 800
    })

    expect(createArtistAvatarKey('canonical-artist', 'a1b2c3d4')).toEqual({
      path: 'artistas/canonical-artist/avatar-a1b2c3d4.webp',
      version: 'a1b2c3d4'
    })
    expect(upload.artistId).toBe(12)
  })

  test('refuses non-WebP or non-800px prepared assets before storage', () => {
    expect(() =>
      parseArtistAvatarUpload({
        artistId: 12,
        blob: new Blob(['prepared'], { type: 'image/png' }),
        width: 800,
        height: 800
      })
    ).toThrow('El avatar debe estar en formato WebP')
    expect(() =>
      parseArtistAvatarUpload({
        artistId: 12,
        blob: new Blob(['prepared'], { type: 'image/webp' }),
        width: 799,
        height: 800
      })
    ).toThrow('El avatar preparado debe medir exactamente 800×800 px')
  })

  test('requires a non-deleted artist with current catalog membership before R2', () => {
    expect(
      requireEligibleArtist({
        id: 12,
        slug: 'canonical-artist',
        artistDeletedAt: null,
        catalogDeletedAt: null
      })
    ).toEqual({ artistId: 12, canonicalSlug: 'canonical-artist' })
    expect(() => requireEligibleArtist(null)).toThrow(
      'Artist avatar is ineligible'
    )
    expect(() =>
      requireEligibleArtist({
        id: 12,
        slug: 'canonical-artist',
        artistDeletedAt: '2026-01-01',
        catalogDeletedAt: null
      })
    ).toThrow('Artist avatar is ineligible')
  })
})

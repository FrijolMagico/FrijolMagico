import { describe, expect, test } from 'bun:test'

import { composeAssetUrl } from './cdn'

describe('composeAssetUrl', () => {
  test('normalizes managed paths and encodes each path segment and version', () => {
    expect(
      composeAssetUrl(
        'https://cdn.example/assets/',
        '/artists/Ada Lovelace.webp',
        '2026/07 18'
      )
    ).toBe(
      'https://cdn.example/assets/artists/Ada%20Lovelace.webp?v=2026%2F07%2018'
    )
  })

  test('preserves absolute legacy URLs without rewriting or adding a version', () => {
    expect(
      composeAssetUrl(
        'https://cdn.example/assets',
        'https://legacy.example/poster.webp?fit=cover',
        'ignored'
      )
    ).toBe('https://legacy.example/poster.webp?fit=cover')
  })

  test('does not append a query string when a managed path has no version', () => {
    expect(
      composeAssetUrl(
        'https://cdn.example/assets//',
        'posters//afiche-12.webp',
        null
      )
    ).toBe('https://cdn.example/assets/posters/afiche-12.webp')
  })
})

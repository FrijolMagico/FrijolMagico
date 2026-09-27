import { describe, expect, test } from 'bun:test'

import {
  composeAssetUrl,
  getAvatarUrl,
  getPosterUrl,
  toRawAssetPath
} from './cdn'

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

describe('getPosterUrl', () => {
  test('resolves relative keys against the environment public CDN URL', () => {
    const base = process.env.R2_PUBLIC_URL ?? 'https://cdn.frijolmagico.cl'
    expect(getPosterUrl('/posters/edition.webp')).toBe(
      `${base}/posters/edition.webp`
    )
  })

  test('preserves absolute URLs and null', () => {
    expect(getPosterUrl('https://legacy.example/poster.webp')).toBe(
      'https://legacy.example/poster.webp'
    )
    expect(getPosterUrl(null)).toBeNull()
  })
})

describe('toRawAssetPath', () => {
  test('reverts the public CDN URL back to the raw R2 key', () => {
    // Uses the same captured base as getAvatarUrl, so it stays correct
    // regardless of R2_PUBLIC_URL in the test environment.
    const full = getAvatarUrl('artistas/42/avatar-abc.webp')
    expect(toRawAssetPath(full)).toBe('artistas/42/avatar-abc.webp')
  })

  test('passes through raw keys unchanged', () => {
    expect(toRawAssetPath('artistas/42/avatar-abc.webp')).toBe(
      'artistas/42/avatar-abc.webp'
    )
  })

  test('passes through foreign absolute URLs unchanged', () => {
    expect(toRawAssetPath('https://legacy.example/poster.webp?fit=cover')).toBe(
      'https://legacy.example/poster.webp?fit=cover'
    )
  })

  test('passes through placeholder paths unchanged', () => {
    expect(toRawAssetPath('/images/placeholder-avatar.svg')).toBe(
      '/images/placeholder-avatar.svg'
    )
  })
})

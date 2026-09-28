import { describe, expect, test } from 'bun:test'

import { FEATURED_ARTISTS_QUERY } from './getFeaturedArtists'

describe('FEATURED_ARTISTS_QUERY', () => {
  test('resolves featured artist names from the primary pseudonym association', () => {
    expect(FEATURED_ARTISTS_QUERY).toContain(
      'primary_pseudonym.pseudonimo AS pseudonimo'
    )
    expect(FEATURED_ARTISTS_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo_principal app ON app.artista_id = a.id'
    )
    expect(FEATURED_ARTISTS_QUERY).toContain(
      'LEFT JOIN artista_pseudonimo primary_pseudonym ON primary_pseudonym.id = app.pseudonimo_id'
    )
    expect(FEATURED_ARTISTS_QUERY).not.toContain('ac.pseudonimo_id')
  })
})

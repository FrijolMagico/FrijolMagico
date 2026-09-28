import { describe, expect, test } from 'bun:test'

import { getActivityArtistContact } from './activity-artist-contact'

describe('getActivityArtistContact', () => {
  test('selects Instagram before later social properties', () => {
    expect(
      getActivityArtistContact(
        '{"web":"https://example.org","instagram":"https://instagram.com/artist"}',
        'artist@example.org'
      )
    ).toEqual({ kind: 'social', href: 'https://instagram.com/artist' })
  })

  test('selects the next valid social property in object order', () => {
    expect(
      getActivityArtistContact(
        '{"instagram":"javascript:alert(1)","first":"ftp://example.org","second":["not a url","https://example.org/artist"]}',
        'artist@example.org'
      )
    ).toEqual({ kind: 'social', href: 'https://example.org/artist' })
  })

  test('falls back to a valid email and rejects malformed email addresses', () => {
    expect(getActivityArtistContact('malformed', 'artist@example.org')).toEqual({
      kind: 'email',
      href: 'mailto:artist@example.org'
    })
    expect(getActivityArtistContact(null, 'javascript:alert(1)')).toBeNull()
    expect(getActivityArtistContact(null, 'artist@localhost')).toBeNull()
  })

  test('rejects invalid JSON, non-object values, non-HTTP URLs and credential URLs', () => {
    for (const rrss of [
      '{broken',
      'null',
      '[]',
      '{"instagram":"javascript:alert(1)"}',
      '{"site":"data:text/html,unsafe"}',
      '{"site":"https://user:pass@example.org"}'
    ]) {
      expect(getActivityArtistContact(rrss, null)).toBeNull()
    }
  })
})

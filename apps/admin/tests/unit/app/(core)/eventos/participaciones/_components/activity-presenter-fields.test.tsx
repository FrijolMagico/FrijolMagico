import { describe, expect, test } from 'bun:test'
import { resolvePresenterText } from '@/core/eventos/participaciones/_components/activity-presenter-fields'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ArtistLookup } from '@/core/eventos/participaciones/_types/participations.types'

const artists: ArtistLookup[] = [
  {
    id: 10,
    pseudonym: 'Primary artist',
    statusId: 1,
    pseudonyms: [
      { id: 101, pseudonym: 'Ada', isPrimary: true },
      { id: 102, pseudonym: 'Lovelace', isPrimary: false }
    ]
  },
  {
    id: 20,
    pseudonym: 'Other artist',
    statusId: 1,
    pseudonyms: [{ id: 201, pseudonym: 'ADA', isPrimary: true }]
  },
  {
    id: 30,
    pseudonym: 'Cancelled artist',
    statusId: ARTIST_STATUS.CANCELLED,
    pseudonyms: [{ id: 301, pseudonym: 'Grace', isPrimary: true }]
  }
]

describe('resolvePresenterText', () => {
  test('matches trimmed pseudonym text case-insensitively when the match is unique', () => {
    expect(resolvePresenterText('  Lovelace  ', artists)).toEqual({
      type: 'linked',
      artistId: 10,
      pseudonymId: 102
    })
  })

  test('keeps unmatched and case-colliding text as a free presenter name', () => {
    expect(resolvePresenterText('Someone new', artists)).toEqual({
      type: 'free',
      presenterNombre: 'Someone new'
    })
    expect(resolvePresenterText(' ada ', artists)).toEqual({
      type: 'free',
      presenterNombre: 'ada'
    })
  })

  test('does not match pseudonyms belonging to cancelled artists', () => {
    expect(resolvePresenterText('Grace', artists)).toEqual({
      type: 'free',
      presenterNombre: 'Grace'
    })
  })

  test('treats trimmed empty text as no presenter', () => {
    expect(resolvePresenterText('  ', artists)).toEqual({ type: 'none' })
  })
})

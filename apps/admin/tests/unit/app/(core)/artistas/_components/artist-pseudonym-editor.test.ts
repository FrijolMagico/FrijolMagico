import { describe, expect, test } from 'bun:test'
import {
  addNewArtistPseudonym,
  clearPseudonymDrafts,
  createNewArtistPseudonymState,
  makeNewArtistPseudonymPrimary,
  persistablePseudonymDrafts,
  updateNewArtistPseudonym,
  upsertPseudonymDraft
} from '@/core/artistas/_schemas/artist-pseudonym.schema'

describe('artist pseudonym editor draft state', () => {
  test('retains text, history and primary choices independently for each pseudonym ID', () => {
    const first = {
      operation: 'edit' as const,
      pseudonymId: 10,
      pseudonym: 'First edited',
      originalText: 'First',
      preserveHistory: true,
      makePrimary: false
    }
    const second = {
      operation: 'edit' as const,
      pseudonymId: 11,
      pseudonym: 'Second',
      originalText: 'Second',
      preserveHistory: false,
      makePrimary: true
    }

    const firstState = upsertPseudonymDraft({}, '10', first)
    const bothState = upsertPseudonymDraft(firstState, '11', second)
    const saved = persistablePseudonymDrafts(bothState)

    expect(saved).toEqual([
      { operation: 'edit', pseudonymId: 10, pseudonym: 'First edited', preserveHistory: true, makePrimary: false },
      { operation: 'edit', pseudonymId: 11, pseudonym: 'Second', preserveHistory: false, makePrimary: true }
    ])
  })

  test('uses the primary identity key before the selector loads and persists a rename', () => {
    const primaryDraft = {
      operation: 'edit' as const,
      pseudonymId: null,
      pseudonym: 'Primary renamed',
      originalText: 'Primary',
      preserveHistory: false,
      makePrimary: false
    }
    const state = upsertPseudonymDraft({}, 'primary', primaryDraft)

    expect(persistablePseudonymDrafts(state)).toEqual([
      { operation: 'edit', pseudonymId: null, pseudonym: 'Primary renamed', preserveHistory: false, makePrimary: false }
    ])
  })

  test('clears pending edits when the dialog is cancelled or closed', () => {
    expect(clearPseudonymDrafts()).toEqual([])
  })

  test('supports multiple creation drafts and switches the primary without losing their text', () => {
    const first = updateNewArtistPseudonym(createNewArtistPseudonymState(), 0, 'Initial Name')
    const withSecond = addNewArtistPseudonym(first)
    const second = updateNewArtistPseudonym(withSecond, 1, 'Second Name')
    const withThird = addNewArtistPseudonym(second)
    const third = updateNewArtistPseudonym(withThird, 2, 'Third Name')
    const switched = makeNewArtistPseudonymPrimary(third, 2)

    expect(switched.drafts).toEqual([
      { id: 0, pseudonym: 'Initial Name' },
      { id: 1, pseudonym: 'Second Name' },
      { id: 2, pseudonym: 'Third Name' }
    ])
    expect(switched.drafts.find(({ id }) => id === switched.primaryId)?.pseudonym).toBe('Third Name')
  })

  test('does not submit an unchanged edit or an empty new pseudonym', () => {
    const state = upsertPseudonymDraft({}, 'primary', {
      operation: 'edit', pseudonymId: null, pseudonym: 'Primary', originalText: 'Primary',
      preserveHistory: false, makePrimary: false
    })
    const withBlankAdd = upsertPseudonymDraft(state, 'new', {
      operation: 'add', pseudonym: ' ', originalText: '', makePrimary: false
    })

    expect(persistablePseudonymDrafts(withBlankAdd)).toEqual([])
  })
})

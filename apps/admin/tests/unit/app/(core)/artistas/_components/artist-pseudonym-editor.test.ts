import { describe, expect, test } from 'bun:test'
import {
  addNewArtistPseudonym,
  canAddNewArtistPseudonym,
  clearPseudonymDrafts,
  createNewArtistPseudonymState,
  getArtistPseudonymCheckboxState,
  getPseudonymCheckboxLabelClass,
  makeNewArtistPseudonymPrimary,
  preserveHistoryForPseudonymText,
  persistablePseudonymDrafts,
  updateNewArtistPseudonym,
  upsertPseudonymDraft
} from '@/core/artistas/_schemas/artist-pseudonym.schema'

describe('artist pseudonym editor draft state', () => {
  test('checks and disables the initially displayed implicit primary before options load', () => {
    expect(getArtistPseudonymCheckboxState({
      adding: false,
      selectedId: null,
      options: [],
      drafts: {},
      currentText: 'Primary',
      originalText: 'Primary'
    })).toMatchObject({ makePrimary: true, primaryDisabled: true })
  })

  test('checks and disables the loaded primary, while another option can become primary', () => {
    const options = [{ id: 10, isPrimary: true }, { id: 11, isPrimary: false }]

    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 10, options, drafts: {}, currentText: 'Primary', originalText: 'Primary'
    })).toMatchObject({ makePrimary: true, primaryDisabled: true })
    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 11, options, drafts: {}, currentText: 'Other', originalText: 'Other'
    })).toMatchObject({ makePrimary: false, primaryDisabled: false })
  })

  test('keeps a pending primary enabled so it can be unchecked and reselected', () => {
    const options = [{ id: 10, isPrimary: true }, { id: 11, isPrimary: false }]
    const pendingOther = {
      '11': {
        operation: 'edit' as const, pseudonymId: 11, pseudonym: 'Other', originalText: 'Other',
        preserveHistory: false, makePrimary: true
      }
    }

    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 10, options, drafts: pendingOther, currentText: 'Primary', originalText: 'Primary'
    })).toMatchObject({ makePrimary: true, primaryDisabled: true })
    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 11, options, drafts: pendingOther, currentText: 'Other', originalText: 'Other'
    })).toMatchObject({ makePrimary: true, primaryDisabled: false })

    const pendingUnchecked = {
      '11': { ...pendingOther['11'], makePrimary: false }
    }
    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 10, options, drafts: pendingUnchecked, currentText: 'Primary', originalText: 'Primary'
    })).toMatchObject({ makePrimary: true, primaryDisabled: true })
    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 11, options, drafts: pendingUnchecked, currentText: 'Other', originalText: 'Other'
    })).toMatchObject({ makePrimary: false, primaryDisabled: false })

    const pendingReselected = {
      '11': { ...pendingOther['11'], makePrimary: true }
    }
    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 10, options, drafts: pendingReselected, currentText: 'Primary', originalText: 'Primary'
    })).toMatchObject({ makePrimary: true, primaryDisabled: true })
    expect(getArtistPseudonymCheckboxState({
      adding: false, selectedId: 11, options, drafts: pendingReselected, currentText: 'Other', originalText: 'Other'
    })).toMatchObject({ makePrimary: true, primaryDisabled: false })
    expect(persistablePseudonymDrafts(pendingReselected)).toEqual([
      { operation: 'edit', pseudonymId: 11, pseudonym: 'Other', preserveHistory: false, makePrimary: true }
    ])
  })

  test('dims disabled checkbox labels and leaves enabled labels undimmed', () => {
    expect(getPseudonymCheckboxLabelClass(true)).toBe('flex items-center gap-2 text-sm opacity-50')
    expect(getPseudonymCheckboxLabelClass(false)).toBe('flex items-center gap-2 text-sm')
  })

  test('enables history only for normalized text changes and clears it on revert', () => {
    const changedDraft = {
      primary: {
        operation: 'edit' as const, pseudonymId: null, pseudonym: 'Renamed', originalText: 'Original',
        preserveHistory: true, makePrimary: false
      }
    }
    const checkboxState = (currentText: string, drafts = changedDraft) => getArtistPseudonymCheckboxState({
      adding: false, selectedId: null, options: [], drafts, currentText, originalText: 'Original'
    })

    expect(checkboxState('Original')).toMatchObject({ preserveHistory: false, historyDisabled: true })
    expect(checkboxState('  Original  ')).toMatchObject({ preserveHistory: false, historyDisabled: true })
    expect(preserveHistoryForPseudonymText('Original', 'Original', true)).toBe(false)
    expect(checkboxState('Renamed')).toMatchObject({ preserveHistory: true, historyDisabled: false })
    expect(preserveHistoryForPseudonymText('Renamed', 'Original', true)).toBe(true)
  })

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

  test('allows adding only after every creation draft has non-empty trimmed text', () => {
    const emptyInitial = createNewArtistPseudonymState()
    expect(canAddNewArtistPseudonym(emptyInitial)).toBe(false)

    const whitespaceInitial = updateNewArtistPseudonym(emptyInitial, 0, '  \t ')
    expect(canAddNewArtistPseudonym(whitespaceInitial)).toBe(false)
    expect(addNewArtistPseudonym(whitespaceInitial)).toBe(whitespaceInitial)

    const filledInitial = updateNewArtistPseudonym(whitespaceInitial, 0, ' First ')
    expect(canAddNewArtistPseudonym(filledInitial)).toBe(true)

    const newBlankDraft = addNewArtistPseudonym(filledInitial)
    expect(newBlankDraft.drafts).toHaveLength(2)
    expect(canAddNewArtistPseudonym(newBlankDraft)).toBe(false)
    expect(addNewArtistPseudonym(newBlankDraft)).toBe(newBlankDraft)

    const switchedPrimary = makeNewArtistPseudonymPrimary(newBlankDraft, 1)
    expect(switchedPrimary.primaryId).toBe(1)
    expect(canAddNewArtistPseudonym(switchedPrimary)).toBe(false)

    const completedSecond = updateNewArtistPseudonym(switchedPrimary, 1, 'Second')
    expect(canAddNewArtistPseudonym(completedSecond)).toBe(true)
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

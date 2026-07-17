import '../../../../../../test-setup'

import { describe, expect, test } from 'bun:test'

import {
  FESTIVAL_ANIMATION_TIMING,
  getCategoryDurationMs,
  getItemStartMs
} from './festival-animation-timing'
import {
  getFestivalSpoilerStorageKey,
  readFestivalSpoilerStorage,
  writeFestivalSpoilerStorage
} from './festival-animation-storage'
import {
  getGlobalSpoilerCommand,
  transitionCategoryState
} from './festival-spoiler-machine'
import { getFestivalAnimationNodes } from './festival-animation-dom'

describe('festival animation timing', () => {
  test('derives stagger offset and category duration from timing constants', () => {
    const { ITEM_DURATION_MS, ITEM_STAGGER_MS } = FESTIVAL_ANIMATION_TIMING

    expect(getItemStartMs(0)).toBe(0)
    expect(getItemStartMs(2)).toBe(2 * ITEM_STAGGER_MS)

    expect(getCategoryDurationMs(0)).toBe(0)
    expect(getCategoryDurationMs(3)).toBe(
      ITEM_DURATION_MS + 2 * ITEM_STAGGER_MS
    )

    expect(ITEM_DURATION_MS).toBeGreaterThan(ITEM_STAGGER_MS)
  })
})

describe('festival spoiler storage and state', () => {
  test('isolates storage and fails safely while retaining legal state transitions', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value)
    }
    writeFestivalSpoilerStorage(storage, 'festival-a', ['arte'])
    expect(getFestivalSpoilerStorageKey('festival-a')).toBe(
      'frijolmagico:festival-spoilers:v1:festival-a'
    )
    expect(readFestivalSpoilerStorage(storage, 'festival-a')).toEqual(['arte'])
    values.set(getFestivalSpoilerStorageKey('festival-a'), '{invalid')
    expect(readFestivalSpoilerStorage(storage, 'festival-a')).toEqual([])
    expect(transitionCategoryState('concealed', 'reveal')).toBe('revealing')
    expect(transitionCategoryState('concealing', 'complete')).toBe('concealed')
    expect(getGlobalSpoilerCommand(['revealed', 'concealed'])).toBe('reveal')
  })
})

describe('festival animation DOM scope', () => {
  test('returns nodes from its local root only', () => {
    const root = document.createElement('div')
    const category = document.createElement('section')
    category.dataset.spoilerCategory = 'arte'
    root.append(category)
    expect(getFestivalAnimationNodes(root).categories).toEqual([category])
  })
})

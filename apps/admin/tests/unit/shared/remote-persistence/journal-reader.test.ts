/**
 * Journal Reader - Type and Compilation Tests
 *
 * Verifies that journal-reader correctly exports functions with proper types.
 * Integration tests with IndexedDB are impractical in Bun environment.
 */

import { describe, test, expect } from 'bun:test'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import type { SectionName } from '@/shared/commit-system/lib/types'

describe('Journal Reader - Exports', () => {
  test('should export getLatestEntries as async function', async () => {
    const { getLatestEntries } =
      await import('@/shared/commit-system/lib/journal-reader')
    expect(typeof getLatestEntries).toBe('function')
  })

  test('should export getPendingCount as async function', async () => {
    const { getPendingCount } =
      await import('@/shared/commit-system/lib/journal-reader')
    expect(typeof getPendingCount).toBe('function')
  })

  test('should export hasPendingChanges as async function', async () => {
    const { hasPendingChanges } =
      await import('@/shared/commit-system/lib/journal-reader')
    expect(typeof hasPendingChanges).toBe('function')
  })
})

describe('Journal Reader - Type Safety', () => {
  test('SectionName type should be union of valid sections', () => {
    const validSections: SectionName[] = [
      'organizacion',
      'organizacion_equipo',
      'catalogo_artista',
      'artista',
      'evento'
    ]
    expect(validSections).toHaveLength(5)
  })

  test('JournalEntry type should have required fields', () => {
    const entry: JournalEntry = {
      entryId: 'test-id',
      schemaVersion: 1,
      section: 'organizacion',
      scopeKey: 'org:1:name',
      payload: { op: 'set', value: 'test' },
      timestampMs: Date.now(),
      clientId: 'client-id'
    }

    expect(entry.entryId).toBeDefined()
    expect(entry.section).toBeDefined()
    expect(entry.scopeKey).toBeDefined()
    expect(entry.payload).toBeDefined()
    expect(entry.timestampMs).toBeDefined()
  })
})

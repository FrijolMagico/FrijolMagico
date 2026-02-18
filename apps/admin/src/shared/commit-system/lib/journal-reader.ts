/**
 * @fileoverview journal-reader.ts - Read-only Journal API wrapper
 *
 * Provides read-only access to the Change Journal (Layer 2: Applied Changes).
 * This module wraps the Journal's public API with type-safe section names and
 * convenient helper functions for checking pending changes.
 *
 * Key responsibilities:
 * - Read latest entries for a section
 * - Count pending changes in a section
 * - Check if a section has any pending changes
 *
 * IMPORTANT: These are READ-ONLY operations. To write changes, use writeEntry
 * from the change-journal module directly.
 *
 * @connection change-journal.ts - Journal write API (separate layer)
 * @connection types.ts - SectionName type definition
 */

import {
  getLatestEntries as getJournalEntries,
  hasEntries
} from '@/shared/change-journal/change-journal'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import type { SectionName } from './types'

/**
 * Get all latest entries for a section, ordered by timestamp DESC (newest first)
 *
 * Returns entries without modifying or consuming them from the journal.
 * Useful for inspection, preview, or counting pending changes before sync.
 *
 * @param section - Section name to query
 * @returns Promise<JournalEntry[]> - Entries sorted newest to oldest
 *
 * @example
 * // Get all pending changes for a section
 * const entries = await getLatestEntries('organizacion')
 * console.log(`Found ${entries.length} pending changes`)
 *
 * @example
 * // Inspect specific change
 * const entries = await getLatestEntries('catalogo')
 * entries.forEach(entry => {
 *   console.log(`${entry.scopeKey}: ${entry.payload.op}`)
 * })
 */
export async function getLatestEntries(
  section: SectionName
): Promise<JournalEntry[]> {
  return getJournalEntries(section)
}

/**
 * Count pending changes in a section
 *
 * Returns the number of journal entries for a section.
 * Useful for showing dirty indicators or progress information.
 *
 * @param section - Section name to count
 * @returns Promise<number> - Count of pending entries
 *
 * @example
 * const count = await getPendingCount('organizacion')
 * if (count > 0) {
 *   console.log(`${count} unsaved changes`)
 * }
 */
export async function getPendingCount(section: SectionName): Promise<number> {
  const entries = await getJournalEntries(section)
  return entries.length
}

/**
 * Check if a section has any pending changes
 *
 * Useful for showing dirty indicators in the UI or determining
 * if a sync operation is needed. More efficient than getPendingCount
 * when you only need a boolean result.
 *
 * @param section - Section name to check
 * @returns Promise<boolean> - True if section has pending entries
 *
 * @example
 * // Show save button only if there are changes
 * const isDirty = await hasPendingChanges('organizacion')
 * if (isDirty) {
 *   showSaveButton()
 * }
 *
 * @example
 * // Warn before navigation
 * if (await hasPendingChanges('catalogo')) {
 *   const confirmLeave = confirm('You have unsaved changes. Leave anyway?')
 *   if (!confirmLeave) return
 * }
 */
export async function hasPendingChanges(
  section: SectionName
): Promise<boolean> {
  return hasEntries(section)
}

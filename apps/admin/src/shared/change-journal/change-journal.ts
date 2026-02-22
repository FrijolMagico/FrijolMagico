/**
 * @fileoverview change-journal.ts - Public API for Change Journal
 *
 * High-level API for writing and reading journal entries. This is the only
 * entry point for the Change Journal system - all other modules are internal.
 *
 * Key responsibilities:
 * - Write changes to the journal (writeEntry)
 * - Read latest entries ordered by timestamp (getLatestEntries)
 * - Check if sections have pending changes (hasEntries)
 * - Clear sections after successful sync (clearSection)
 *
 * Architecture:
 * - Singleton JournalStorage instance (one IndexedDB connection)
 * - Auto-generates entryId and clientId UUIDs
 * - Orders entries by timestamp DESC for consumption
 *
 * @connection storage.ts - JournalStorage class (internal)
 * @connection types.ts - JournalEntry, JournalPayload (internal)
 * @connection constants.ts - CURRENT_SCHEMA_VERSION (internal)
 */

import { CURRENT_SCHEMA_VERSION } from './lib/constants'
import { JournalStorage } from './lib/storage'
import type { JournalEntry, JournalPayload, WriteResult } from './lib/types'

/**
 * Singleton storage instance
 * Created once and reused across all journal operations
 * Ensures single IndexedDB connection per app lifecycle
 */
const storage = new JournalStorage()

/**
 * Write a change entry to the journal
 *
 * Creates a new journal entry with auto-generated IDs and persists it to IndexedDB.
 * All changes go through this function before being applied to the UI state.
 *
 * @param section - Section name (e.g., 'organizacion', 'equipo', 'catalogo')
 * @param scopeKey - Deduplication key (e.g., 'organizacion:org-123:name')
 * @param payload - Operation payload (set, unset, or patch)
 * @param meta - Optional metadata (sessionId)
 * @returns Promise<WriteResult> - Success status and optional error message
 *
 * @example
 * // Write a complete entity replacement
 * const result = await writeEntry(
 *   'organizacion',
 *   'organizacion:org-123',
 *   { op: 'set', value: { id: 'org-123', nombre: 'Nueva Org' } }
 * )
 * if (!result.success) {
 *   console.error('Failed to write entry:', result.error)
 * }
 *
 * @example
 * // Write a field update
 * const result = await writeEntry(
 *   'organizacion',
 *   'organizacion:org-123:nombre',
 *   { op: 'set', value: 'Nombre Actualizado' }
 * )
 *
 * @example
 * // Delete an entity
 * await writeEntry(
 *   'organizacion',
 *   'organizacion:org-123',
 *   { op: 'unset' }
 * )
 *
 * @example
 * // Partial update (patch)
 * await writeEntry(
 *   'organizacion',
 *   'organizacion:org-123',
 *   { op: 'patch', value: { nombre: 'Nuevo Nombre' } }
 * )
 */
export async function writeEntry(
  section: string,
  scopeKey: string,
  payload: JournalPayload,
  meta?: { sessionId?: string }
): Promise<WriteResult> {
  const entry: JournalEntry = {
    entryId: crypto.randomUUID(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    section,
    scopeKey,
    payload,
    timestampMs: Date.now(),
    clientId: crypto.randomUUID(),
    sessionId: meta?.sessionId
  }

  return storage.writeEntry(entry)
}

/**
 * Get latest entries for a section, ordered by timestamp DESC (newest first)
 *
 * Returns all journal entries for a section without clearing them.
 * Useful for preview/inspection before sync.
 *
 * @param section - Section name to query
 * @returns Promise<JournalEntry[]> - Entries sorted newest to oldest
 *
 * @example
 * const entries = await getLatestEntries('organizacion')
 * console.log(`Found ${entries.length} pending changes`)
 * entries.forEach(entry => {
 *   console.log(`${entry.scopeKey}: ${entry.payload.op}`)
 * })
 */
export async function getLatestEntries(
  section: string
): Promise<JournalEntry[]> {
  const entries = await storage.getEntries(section)

  // Storage returns ASC, reverse for DESC (newest first)
  return entries.reverse()
}

/**
 * Check if a section has any pending entries
 *
 * Useful for showing dirty indicators in the UI or determining
 * if a sync operation is needed.
 *
 * @param section - Section name to check
 * @returns Promise<boolean> - True if section has entries
 *
 * @example
 * const isDirty = await hasEntries('organizacion')
 * if (isDirty) {
 *   showSaveButton()
 * }
 *
 * @example
 * // Check before navigation
 * if (await hasEntries('organizacion')) {
 *   const confirmLeave = confirm('You have unsaved changes. Leave anyway?')
 *   if (!confirmLeave) return
 * }
 */
export async function hasEntries(section: string): Promise<boolean> {
  return storage.hasEntries(section)
}

/**
 * Clear all entries for a section
 *
 * Use after successful sync to server. Does NOT return the cleared entries -
 * use getLatestEntries before clearing if you need the entries.
 *
 * @param section - Section name to clear
 * @returns Promise<void>
 *
 * @example
 * // After successful sync
 * await syncToServer(entries)
 * await clearSection('organizacion')
 * console.log('Section cleared after successful sync')
 *
 * @example
 * // Discard all pending changes (danger!)
 * if (confirm('Discard all unsaved changes?')) {
 *   await clearSection('organizacion')
 * }
 */
export async function clearSection(section: string): Promise<void> {
  await storage.clearSection(section)
}

/**
 * Get all sections that have pending entries, with entry counts
 *
 * Useful for showing which sections have unsaved changes — particularly
 * for crash recovery notification on app mount.
 *
 * @returns Promise<Array<{ section: string; count: number }>> - Sections with pending entries
 *
 * @example
 * // Show draft recovery notification
 * const sections = await getSectionsWithChanges()
 * if (sections.length > 0) {
 *   showRecoveryNotification(sections)
 * }
 *
 * @example
 * // List pending sections
 * const sections = await getSectionsWithChanges()
 * sections.forEach(({ section, count }) => {
 *   console.log(`${section}: ${count} pending changes`)
 * })
 */
export async function getSectionsWithChanges(): Promise<
  Array<{ section: string; count: number }>
> {
  const sections = await storage.getAllSections()
  const results = await Promise.all(
    sections.map(async (section) => {
      const entries = await storage.getEntries(section)
      return { section, count: entries.length }
    })
  )
  return results
}

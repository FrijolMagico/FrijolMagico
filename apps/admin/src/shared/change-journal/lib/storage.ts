/**
 * @fileoverview storage.ts - IndexedDB Storage Layer for Change Journal
 *
 * Implements persistent storage for journal entries using Dexie.js (IndexedDB wrapper).
 * This is the lowest layer of the Change Journal system - only handles persistence/retrieval.
 *
 * Key responsibilities:
 * - Write validated entries to IndexedDB
 * - Read entries by section (ordered by timestamp)
 * - Clear sections
 * - Query journal metadata
 *
 * Error handling: All errors are logged but not thrown to prevent app crashes.
 * Validation: All entries are validated with Zod before writing.
 *
 * @connection types.ts - JournalEntry interface
 * @connection schema.ts - journalEntrySchema validator
 * @connection constants.ts - CURRENT_SCHEMA_VERSION
 */

import Dexie, { type EntityTable } from 'dexie'
import { journalEntrySchema } from './schema'
import type { JournalEntry, WriteResult } from './types'

/**
 * Dexie database class for Change Journal storage
 * Single version with simple schema - no migrations needed for MVP
 */
class JournalDatabase extends Dexie {
  entries!: EntityTable<JournalEntry, 'entryId'>

  constructor() {
    super('frijolmagico-journal')

    // Version 1: Initial schema
    // Indexes: section and scopeKey for efficient queries
    // ++id auto-generates the primary key if not provided, but we use entryId
    this.version(1).stores({
      entries: '&entryId, section, scopeKey, timestampMs'
    })
  }
}

/**
 * JournalStorage - IndexedDB persistence layer for journal entries
 *
 * Provides CRUD operations for journal entries with:
 * - Zod validation before writing
 * - Graceful error handling (logs, doesn't throw)
 * - Ordered retrieval by timestamp
 * - Section-based organization
 */
export class JournalStorage {
  private db: JournalDatabase

  constructor() {
    this.db = new JournalDatabase()
  }

  /**
   * Write a journal entry to IndexedDB
   * Validates with Zod before persisting
   *
   * @param entry - JournalEntry to persist
   * @returns Promise<WriteResult>
   *
   * @example
   * await storage.writeEntry({
   *   entryId: crypto.randomUUID(),
   *   schemaVersion: 1,
   *   section: 'organizacion',
   *   scopeKey: 'organizacion:org-123:name',
   *   payload: { op: 'set', value: 'New Name' },
   *   timestampMs: Date.now(),
   *   clientId: 'client-uuid'
   * })
   */
  async writeEntry(entry: JournalEntry): Promise<WriteResult> {
    try {
      // Validate entry with Zod schema
      const validatedEntry = journalEntrySchema.parse(entry)

      // Persist to IndexedDB
      await this.db.entries.put(validatedEntry)
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[JournalStorage] Failed to write entry:', error)
      console.error('[JournalStorage] Entry that failed:', entry)
      // Return error result instead of throwing
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get all entries for a specific section, ordered by timestamp ASC
   *
   * @param section - Section name (e.g., 'organizacion', 'equipo')
   * @returns Promise<JournalEntry[]> - Entries ordered by timestampMs
   *
   * @example
   * const entries = await storage.getEntries('organizacion')
   * // Returns entries sorted oldest to newest
   */
  async getEntries(section: string): Promise<JournalEntry[]> {
    try {
      // Query by section index, sort by timestamp ascending
      const entries = await this.db.entries
        .where('section')
        .equals(section)
        .sortBy('timestampMs')

      return entries
    } catch (error) {
      console.error(
        `[JournalStorage] Failed to get entries for section "${section}":`,
        error
      )
      // Return empty array on error to prevent crashes
      return []
    }
  }

  /**
   * Clear all entries for a specific section
   * Used after successful sync to server
   *
   * @param section - Section name to clear
   * @returns Promise<void>
   *
   * @example
   * await storage.clearSection('organizacion')
   */
  async clearSection(section: string): Promise<void> {
    try {
      // Delete all entries matching the section
      await this.db.entries.where('section').equals(section).delete()
    } catch (error) {
      console.error(
        `[JournalStorage] Failed to clear section "${section}":`,
        error
      )
      // Graceful failure - log but don't throw
    }
  }

  /**
   * Check if a section has any entries
   * Useful for determining if there are unsaved changes
   *
   * @param section - Section name to check
   * @returns Promise<boolean> - True if entries exist
   *
   * @example
   * const hasPendingChanges = await storage.hasEntries('organizacion')
   */
  async hasEntries(section: string): Promise<boolean> {
    try {
      // Count entries for section - more efficient than fetching all
      const count = await this.db.entries
        .where('section')
        .equals(section)
        .count()
      return count > 0
    } catch (error) {
      console.error(
        `[JournalStorage] Failed to check entries for section "${section}":`,
        error
      )
      // Return false on error (conservative approach)
      return false
    }
  }

  /**
   * Get all unique section names that have entries
   * Useful for discovering which sections have pending changes
   *
   * @returns Promise<string[]> - Array of section names
   *
   * @example
   * const sections = await storage.getAllSections()
   * // Returns ['organizacion', 'equipo', 'catalogo']
   */
  async getAllSections(): Promise<string[]> {
    try {
      // Get all entries and extract unique section names
      const entries = await this.db.entries.toArray()
      const sections = [...new Set(entries.map((entry) => entry.section))]
      return sections
    } catch (error) {
      console.error('[JournalStorage] Failed to get all sections:', error)
      // Return empty array on error
      return []
    }
  }
}

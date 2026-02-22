import Dexie, { type EntityTable } from 'dexie'
import { journalEntrySchema } from './schema'
import type { JournalEntry, JournalMethodResult } from './types'
import { CURRENT_SCHEMA_VERSION, JOURNAL_DATABASE_NAME } from './constants'

class JournalDatabase extends Dexie {
  entries!: EntityTable<JournalEntry, 'entryId'>

  constructor() {
    super(JOURNAL_DATABASE_NAME)

    this.version(CURRENT_SCHEMA_VERSION).stores({
      entries: '&entryId, section, scopeKey, timestampMs'
    })
  }
}

export class JournalStorage {
  private db: JournalDatabase

  constructor() {
    this.db = new JournalDatabase()
  }

  async writeEntry(entry: JournalEntry): Promise<JournalMethodResult> {
    try {
      // Validate entry with Zod schema
      const validatedEntry = journalEntrySchema.parse(entry)

      // Persist to IndexedDB
      await this.db.entries.put(validatedEntry)
      return { success: true, result: validatedEntry }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('[JournalStorage] Failed to write entry:', error)
      console.error('[JournalStorage] Entry that failed:', entry)

      // Return error result instead of throwing
      return { success: false, error: errorMessage }
    }
  }

  async getEntries(
    section: string
  ): Promise<JournalMethodResult<JournalEntry[]>> {
    try {
      // Query by section index, sort by timestamp ascending
      const entries = await this.db.entries
        .where('section')
        .equals(section)
        .sortBy('timestampMs')

      return { success: true, result: entries }
    } catch (error) {
      console.error(
        `[JournalStorage] Failed to get entries for section "${section}":`,
        error
      )
      // Return empty array on error to prevent crashes
      return { success: false, error: 'Failed to retrieve entries' }
    }
  }

  async clearSection(section: string): Promise<JournalMethodResult> {
    try {
      // Delete all entries matching the section
      await this.db.entries.where('section').equals(section).delete()
      return { success: true, result: null }
    } catch (error) {
      console.error(
        `[JournalStorage] Failed to clear section "${section}":`,
        error
      )
      return { success: false, error: 'Failed to clear section' }
    }
  }

  async hasEntries(section: string): Promise<JournalMethodResult<boolean>> {
    try {
      // Count entries for section - more efficient than fetching all
      const count = await this.db.entries
        .where('section')
        .equals(section)
        .count()
      return { success: true, result: count > 0 }
    } catch (error) {
      console.error(
        `[JournalStorage] Failed to check entries for section "${section}":`,
        error
      )
      return { success: false, error: 'Failed to check entries' }
    }
  }

  async getAllSections(): Promise<JournalMethodResult<string[]>> {
    try {
      // Get all entries and extract unique section names
      const entries = await this.db.entries.toArray()
      const sections = [...new Set(entries.map((entry) => entry.section))]
      return { success: true, result: sections }
    } catch (error) {
      console.error('[JournalStorage] Failed to get all sections:', error)
      // Return empty array on error
      return {
        success: false,
        result: [],
        error: 'Failed to retrieve sections'
      }
    }
  }
}

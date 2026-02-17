/**
 * Current schema version for change journal entries
 * Increment this when making breaking changes to JournalEntry structure
 */
export const CURRENT_SCHEMA_VERSION = 1

/**
 * Valid operation types for journal payloads
 * - 'set': Complete value replacement
 * - 'unset': Delete/remove the value
 * - 'patch': Partial update (shallow merge)
 */
export const JOURNAL_OPS = {
  SET: 'set',
  UNSET: 'unset',
  PATCH: 'patch'
} as const

export type JournalOp = (typeof JOURNAL_OPS)[keyof typeof JOURNAL_OPS]

/**
 * Default journal metadata
 * Used for initializing new journal state
 */
export const DEFAULT_JOURNAL_META = {
  totalEntries: 0,
  lastEntryTimestamp: null,
  isDirty: false,
  schemaVersion: CURRENT_SCHEMA_VERSION
} as const

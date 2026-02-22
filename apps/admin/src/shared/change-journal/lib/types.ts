/**
 * @fileoverview types.ts - Change Journal Type System
 *
 * Defines the type system for the Change Journal module (Layer 2: Applied Changes).
 * The journal acts as the source of truth for all user-initiated modifications before
 * persisting to the server.
 *
 * Key concepts:
 * - JournalEntry: Immutable record of a user change
 * - JournalPayload: Discriminated union of operations (set, unset, patch)
 * - scopeKey: Deduplication key (section:entityId:field)
 * - JournalMeta: Metadata about the journal state
 *
 * @connection entity-types.ts - EntityOperation<T> interface
 * @connection schema.ts - Zod validation schemas
 */

/**
 * Result of writing a journal entry
 * Indicates success or failure with optional error message
 */
export type WriteResult = { success: true } | { success: false; error: string }

/**
 * Discriminated union for journal operations
 * Supports three types: set (complete replacement), unset (deletion), patch (partial update)
 */
export type JournalPayload =
  | { op: 'set'; value: unknown }
  | { op: 'unset' }
  | { op: 'patch'; value: unknown }
  | { op: 'restore' }

/**
 * Single immutable entry in the change journal
 *
 * Represents one user-initiated change with all metadata needed for:
 * - Deduplication (via scopeKey)
 * - Ordering (via timestampMs, clientId)
 * - Session tracking (via sessionId)
 * - Schema versioning (via schemaVersion)
 */
export interface JournalEntry {
  /**
   * UUID for this journal entry (globally unique)
   * Used as the primary key for journal persistence
   */
  entryId: string

  /**
   * Schema version for forward/backward compatibility
   * Current version: 1
   */
  schemaVersion: number

  /**
   * Section name within the app (e.g., 'organizacion', 'equipo', 'catalogo')
   * Used to scope changes to features
   */
  section: string

  /**
   * Deduplication key for idempotent operations
   * Format: "section:entityId:field" or "section:entityId" for entity-level
   * Allows replacing previous changes to the same entity/field
   */
  scopeKey: string

  /**
   * The actual change operation (discriminated union)
   * - { op: 'set', value: unknown }: Complete replacement
   * - { op: 'unset' }: Delete/unset the value
   * - { op: 'patch', value: unknown }: Partial update (merge)
   */
  payload: JournalPayload

  /**
   * Timestamp in milliseconds (Date.now())
   * Used to determine order of application
   */
  timestampMs: number

  /**
   * Client identifier (UUID) to handle offline sync
   * Allows deduplicating entries from the same client
   */
  clientId: string

  /**
   * Optional session identifier (UUID)
   * Groups entries created in the same session
   */
  sessionId?: string
}

/**
 * Metadata about the journal state
 * Used to track journal health and lifecycle
 */
export interface JournalMeta {
  /**
   * Total number of entries in the journal
   */
  totalEntries: number

  /**
   * Timestamp of the last entry added
   */
  lastEntryTimestamp: number | null

  /**
   * Indicates if the journal has unsaved changes
   * True = entries exist but haven't been persisted to server
   */
  isDirty: boolean

  /**
   * Schema version of the journal
   * Used to detect incompatibilities
   */
  schemaVersion: number
}

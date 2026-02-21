import { z } from 'zod'
import type { JournalEntry, JournalPayload, JournalMeta } from './types'

/**
 * Zod schema for validating JournalPayload discriminated union
 * Ensures only valid operations are accepted (set, unset, patch)
 */
const journalPayloadSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('set'), value: z.unknown() }),
  z.object({ op: z.literal('unset') }),
  z.object({ op: z.literal('patch'), value: z.unknown() }),
  z.object({ op: z.literal('restore') })
]) as z.ZodType<JournalPayload>

/**
 * Zod schema for validating individual JournalEntry
 * Validates all required fields and types
 */
export const journalEntrySchema = z.object({
  entryId: z.string().uuid('Entry ID must be a valid UUID'),
  schemaVersion: z.number().int().min(1, 'Schema version must be >= 1'),
  section: z
    .string()
    .min(1, 'Section cannot be empty')
    .max(100, 'Section name too long'),
  scopeKey: z
    .string()
    .min(1, 'Scope key cannot be empty')
    .max(255, 'Scope key too long'),
  payload: journalPayloadSchema,
  timestampMs: z.number().int().positive('Timestamp must be positive'),
  clientId: z.string().uuid('Client ID must be a valid UUID'),
  sessionId: z.string().uuid('Session ID must be a valid UUID').optional()
}) as z.ZodType<JournalEntry>

/**
 * Zod schema for validating JournalMeta
 * Validates metadata consistency
 */
export const journalMetaSchema = z.object({
  totalEntries: z
    .number()
    .int()
    .nonnegative('Total entries cannot be negative'),
  lastEntryTimestamp: z
    .number()
    .int()
    .positive('Last entry timestamp must be positive')
    .nullable(),
  isDirty: z.boolean(),
  schemaVersion: z.number().int().min(1, 'Schema version must be >= 1')
}) as z.ZodType<JournalMeta>

/**
 * Zod schema for validating array of journal entries
 * Used when processing batches of entries
 */
export const journalEntriesSchema = z.array(journalEntrySchema)

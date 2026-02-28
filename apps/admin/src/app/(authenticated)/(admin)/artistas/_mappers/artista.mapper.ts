/**
 * @fileoverview artista.mapper.ts - Artista Journal Mappers
 *
 * Transforms JournalEntry payloads into validated DB inputs for artista tables.
 * Critical validation layer: payload.value (unknown) → typed, validated input.
 *
 * Key responsibilities:
 * - Validate payload.value against Zod schemas
 * - Map journal entries to DB inputs (CREATE/UPDATE)
 * - Propagate validation errors (fail fast on bad data)
 *
 * @connection schemas/artista.schema.ts - Zod validation schemas
 * @connection change-journal/lib/types.ts - JournalEntry type
 */

import type { JournalEntry } from '@/shared/change-journal/lib/types'
import { nullsToUndefined } from '@/shared/lib/utils'
import {
  artistaImagenSchema,
  artistaSchema,
  type ArtistaImagenInput,
  type ArtistaInput
} from '../_schemas/artista.schema'

/**
 * Maps JournalEntry to validated ArtistaInput
 *
 * @param entry - Journal entry with 'artista' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToArtistaInput(
  entry: JournalEntry
): Partial<ArtistaInput> {
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(`Cannot map ${entry.payload.op} operation to ArtistaInput`)
  }

  // Validate payload.value against schema (partial for UPDATE support)
  // This will throw ZodError if validation fails
  return artistaSchema.partial().parse(nullsToUndefined(entry.payload.value as Record<string, unknown>))
}

/**
 * Maps JournalEntry to validated ArtistaImagenInput
 *
 * @param entry - Journal entry with 'artista-imagen' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToArtistaImagenInput(
  entry: JournalEntry
): Partial<ArtistaImagenInput> {
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(
      `Cannot map ${entry.payload.op} operation to ArtistaImagenInput`
    )
  }

  // Validate payload.value against schema (partial for UPDATE support)
  // This will throw ZodError if validation fails
  return artistaImagenSchema.partial().parse(nullsToUndefined(entry.payload.value as Record<string, unknown>))
}

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
import {
  artistaImagenSchema,
  artistaSchema,
  catalogoArtistaSchema,
  type ArtistaImagenInput,
  type ArtistaInput,
  type CatalogoArtistaInput
} from '../schemas/artista.schema'

/**
 * Maps JournalEntry to validated ArtistaInput
 *
 * @param entry - Journal entry with 'artista' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToArtistaInput(entry: JournalEntry): ArtistaInput {
  if (entry.payload.op === 'unset') {
    throw new Error('Cannot map unset operation to ArtistaInput')
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return artistaSchema.parse(entry.payload.value)
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
): ArtistaImagenInput {
  if (entry.payload.op === 'unset') {
    throw new Error('Cannot map unset operation to ArtistaImagenInput')
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return artistaImagenSchema.parse(entry.payload.value)
}

/**
 * Maps JournalEntry to validated CatalogoArtistaInput
 *
 * @param entry - Journal entry with 'catalogo-artista' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToCatalogoArtistaInput(
  entry: JournalEntry
): CatalogoArtistaInput {
  if (entry.payload.op === 'unset') {
    throw new Error('Cannot map unset operation to CatalogoArtistaInput')
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return catalogoArtistaSchema.parse(entry.payload.value)
}

/**
 * @fileoverview evento.mapper.ts - Evento Journal Mappers
 *
 * Transforms JournalEntry payloads into validated DB inputs for evento tables.
 * Critical validation layer: payload.value (unknown) → typed, validated input.
 *
 * Key responsibilities:
 * - Validate payload.value against Zod schemas
 * - Map journal entries to DB inputs (CREATE/UPDATE)
 * - Propagate validation errors (fail fast on bad data)
 * - Handle complex evento hierarchy (evento → edicion → dia)
 *
 * @connection schemas/evento.schema.ts - Zod validation schemas
 * @connection change-journal/lib/types.ts - JournalEntry type
 */

import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  eventoEdicionDiaSchema,
  eventoEdicionSchema,
  eventoSchema,
  type EventoEdicionDiaInput,
  type EventoEdicionInput,
  type EventoInput
} from '../schemas/evento.schema'

/**
 * Maps JournalEntry to validated EventoInput
 *
 * @param entry - Journal entry with 'evento' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToEventoInput(entry: JournalEntry): EventoInput {
  if (entry.payload.op === 'unset') {
    throw new Error('Cannot map unset operation to EventoInput')
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return eventoSchema.parse(entry.payload.value)
}

/**
 * Maps JournalEntry to validated EventoEdicionInput
 *
 * @param entry - Journal entry with 'evento-edicion' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToEventoEdicionInput(
  entry: JournalEntry
): EventoEdicionInput {
  if (entry.payload.op === 'unset') {
    throw new Error('Cannot map unset operation to EventoEdicionInput')
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return eventoEdicionSchema.parse(entry.payload.value)
}

/**
 * Maps JournalEntry to validated EventoEdicionDiaInput
 *
 * @param entry - Journal entry with 'evento-edicion-dia' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToEventoEdicionDiaInput(
  entry: JournalEntry
): EventoEdicionDiaInput {
  if (entry.payload.op === 'unset') {
    throw new Error('Cannot map unset operation to EventoEdicionDiaInput')
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return eventoEdicionDiaSchema.parse(entry.payload.value)
}

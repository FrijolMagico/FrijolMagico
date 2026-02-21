/**
 * @fileoverview organizacion.mapper.ts - Organizacion Journal Mappers
 *
 * Transforms JournalEntry payloads into validated DB inputs for organizacion tables.
 * Critical validation layer: payload.value (unknown) → typed, validated input.
 *
 * Key responsibilities:
 * - Validate payload.value against Zod schemas
 * - Map journal entries to DB inputs (CREATE/UPDATE)
 * - Propagate validation errors (fail fast on bad data)
 *
 * @connection schemas/organizacion.schema.ts - Zod validation schemas
 * @connection change-journal/lib/types.ts - JournalEntry type
 */

import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  organizacionEquipoSchema,
  organizacionSchema,
  type OrganizacionEquipoInput,
  type OrganizacionInput
} from '../schemas/organizacion.schema'

/**
 * Maps JournalEntry to validated OrganizacionInput
 *
 * @param entry - Journal entry with 'organizacion' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToOrganizacionInput(entry: JournalEntry): OrganizacionInput {
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(
      `Cannot map ${entry.payload.op} operation to OrganizacionInput`
    )
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return organizacionSchema.parse(entry.payload.value)
}

/**
 * Maps JournalEntry to validated OrganizacionEquipoInput
 *
 * @param entry - Journal entry with 'organizacion-equipo' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToOrganizacionEquipoInput(
  entry: JournalEntry
): OrganizacionEquipoInput {
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(
      `Cannot map ${entry.payload.op} operation to OrganizacionEquipoInput`
    )
  }

  // Validate payload.value against schema
  // This will throw ZodError if validation fails
  return organizacionEquipoSchema.parse(entry.payload.value)
}

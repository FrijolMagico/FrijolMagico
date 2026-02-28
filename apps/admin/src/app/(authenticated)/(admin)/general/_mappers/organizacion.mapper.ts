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
import { nullsToUndefined } from '@/shared/lib/utils'
import {
  organizacionEquipoSchema,
  organizacionSchema,
  type OrganizacionEquipoInput,
  type OrganizacionInput
} from '../_schemas/organizacion.schema'

/**
 * Maps JournalEntry to validated OrganizacionInput
 *
 * @param entry - Journal entry with 'organizacion' section
 * @returns Validated input ready for DB insert/update
 * @throws Error if entry.payload.op is 'unset'
 * @throws ZodError if payload.value doesn't match schema
 */
export function mapToOrganizacionInput(
  entry: JournalEntry
): Partial<OrganizacionInput> {
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(
      `Cannot map ${entry.payload.op} operation to OrganizacionInput`
    )
  }

  const cleanData = nullsToUndefined(entry.payload.value as Record<string, unknown>)
  if (entry.payload.op === 'patch') {
    return organizacionSchema.partial().parse(cleanData)
  }
  return organizacionSchema.parse(cleanData)
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
): Partial<OrganizacionEquipoInput> {
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(
      `Cannot map ${entry.payload.op} operation to OrganizacionEquipoInput`
    )
  }

  const cleanData = nullsToUndefined(entry.payload.value as Record<string, unknown>)
  if (entry.payload.op === 'patch') {
    return organizacionEquipoSchema.partial().parse(cleanData)
  }
  return organizacionEquipoSchema.parse(cleanData)
}

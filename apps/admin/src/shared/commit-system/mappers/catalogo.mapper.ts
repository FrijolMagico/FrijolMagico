/**
 * @fileoverview catalogo.mapper.ts - Mappers for Catalogo Journal Entries
 *
 * Transforms JournalEntry payloads into validated inputs for catalogo operations.
 * All mappers use Zod schemas to ensure type safety and fail fast on invalid data.
 *
 * @connection schemas/catalogo.schema.ts - Zod validation schemas
 * @connection @/shared/change-journal/lib/types - JournalEntry type
 */

import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  catalogoArtistaSchema,
  type CatalogoArtistaInput
} from '../schemas/catalogo.schema'

/**
 * Maps a JournalEntry to a validated CatalogoArtistaInput
 *
 * @param entry - The journal entry containing the catalogo_artista payload
 * @returns Validated CatalogoArtistaInput ready for database operations
 * @throws ZodError if validation fails (fail fast approach)
 *
 * @example
 * ```typescript
 * const entry: JournalEntry = {
 *   entryId: '...',
 *   section: 'catalogo',
 *   payload: {
 *     op: 'set',
 *     value: {
 *       artistaId: 1,
 *       orden: '001',
 *       destacado: true,
 *       activo: true
 *     }
 *   },
 *   // ... other fields
 * }
 *
 * const input = mapToCatalogoArtistaInput(entry)
 * // input is now type-safe and validated
 * ```
 */
export function mapToCatalogoArtistaInput(
  entry: JournalEntry
): CatalogoArtistaInput {
  // Validate that the entry has a value (not 'unset' operation)
  if (entry.payload.op === 'unset') {
    throw new Error(
      'Cannot map unset operation to CatalogoArtistaInput. Use delete operations instead.'
    )
  }

  // Parse and validate the payload value with Zod schema
  // This will throw ZodError if validation fails (fail fast)
  return catalogoArtistaSchema.parse(entry.payload.value)
}

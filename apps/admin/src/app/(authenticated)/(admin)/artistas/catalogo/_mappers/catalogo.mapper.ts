import type { JournalEntry } from '@/shared/change-journal/lib/types'
import { nullsToUndefined } from '@/shared/lib/utils'
import {
  catalogoArtistaSchema,
  type CatalogoArtistaInput
} from '../_schemas/catalogo.schema'

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
): Partial<CatalogoArtistaInput> {
  // Validate that the entry has a value (not 'unset' operation)
  if (entry.payload.op === 'unset' || entry.payload.op === 'restore') {
    throw new Error(
      `Cannot map ${entry.payload.op} operation to CatalogoArtistaInput. Use delete operations instead.`
    )
  }

  const cleanData = nullsToUndefined(
    entry.payload.value as Record<string, unknown>
  )
  if (entry.payload.op === 'patch') {
    return catalogoArtistaSchema.partial().parse(cleanData)
  }
  return catalogoArtistaSchema.parse(cleanData)
}

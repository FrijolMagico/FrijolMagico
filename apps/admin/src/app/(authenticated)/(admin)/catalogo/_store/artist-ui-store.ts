import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { CatalogArtist } from '../_types'
import { ARTIST_SECTION_NAME } from '../_constants'

/**
 * Escribe cambios de artistas al change-journal.
 *
 * Mapea EntityOperations a entradas de journal con estructura:
 * - section: 'artistas' (scope lógico)
 * - scopeKey: Para ADD/DELETE: 'artistas:artist-123'
 * - scopeKey: Para UPDATE: 'artistas:artist-123:field'
 * - payload: Operación transformada a journal format
 *
 * @param operation - Operación de entidad (ADD/UPDATE/DELETE)
 */
async function writeArtistJournal(
  operation: EntityOperation<CatalogArtist>
): Promise<void> {
  const section = ARTIST_SECTION_NAME

  switch (operation.type) {
    case 'ADD':
      await writeEntry(section, `${section}:${operation.id}`, {
        op: 'set',
        value: operation.entity
      })
      break

    case 'UPDATE':
      if (operation.data) {
        for (const [field, value] of Object.entries(operation.data)) {
          await writeEntry(section, `${section}:${operation.id}:${field}`, {
            op: 'set',
            value
          })
        }
      }
      break

    case 'DELETE':
      await writeEntry(section, `${section}:${operation.id}`, { op: 'unset' })
      break
  }
}

/**
 * Store de estado UI para los artistas del catálogo.
 *
 * Usa Entity State Factory en modo colección.
 * Maneja operaciones CRUD sobre artistas con:
 * - Estado normalizado (O(1) lookups)
 * - 3 capas: remoteData, appliedChanges, currentEdits
 */
export const useArtistUIStore = createEntityUIStateStore<CatalogArtist>({
  sectionName: ARTIST_SECTION_NAME,
  idField: 'artistaId',
  writeToJournal: writeArtistJournal
})

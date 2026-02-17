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
 * - scopeKey: 'artistas:artist-123'
 * - payload: Operación transformada a journal format
 *
 * @param operation - Operación de entidad (ADD/UPDATE/DELETE)
 */
async function writeArtistJournal(operation: EntityOperation<CatalogArtist>) {
  const section = ARTIST_SECTION_NAME
  const scopeKey = `${section}:${operation.id}`

  if (operation.type === 'ADD' && operation.data) {
    await writeEntry(section, scopeKey, {
      op: 'set',
      value: operation.data as CatalogArtist
    })
  } else if (operation.type === 'UPDATE' && operation.data) {
    await writeEntry(section, scopeKey, { op: 'patch', value: operation.data })
  } else if (operation.type === 'DELETE') {
    await writeEntry(section, scopeKey, { op: 'unset' })
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

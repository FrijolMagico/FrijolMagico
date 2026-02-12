import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { CatalogArtist } from '../_types'
import { ARTIST_SECTION_NAME } from '../_constants'

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
  // TODO: Conectar con el sistema de change-journal cuando esté implementado
  writeToJournal: async (op: EntityOperation<CatalogArtist>) => {
    console.log('[artistaUIStore] Writing to journal:', op)
  }
})

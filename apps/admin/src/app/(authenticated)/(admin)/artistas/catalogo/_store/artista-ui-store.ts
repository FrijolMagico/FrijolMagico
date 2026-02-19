import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import type { Artista } from '../_types'

/**
 * Escribe cambios de artistas al change-journal.
 *
 * Mapea EntityOperations a entradas de journal con estructura:
 * - section: 'artista' (scope lógico)
 * - scopeKey: Para ADD/DELETE: 'artista:123'
 * - scopeKey: Para UPDATE: 'artista:123:field'
 * - payload: Operación transformada a journal format
 *
 * @param operation - Operación de entidad (ADD/UPDATE/DELETE)
 */
async function writeArtistaJournal(
  operation: EntityOperation<Artista>
): Promise<void> {
  const section = JOURNAL_ENTITIES.ARTISTA

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
export const useArtistaUIStore = createEntityUIStateStore<Artista>({
  sectionName: JOURNAL_ENTITIES.ARTISTA,
  idField: 'id',
  writeToJournal: writeArtistaJournal
})

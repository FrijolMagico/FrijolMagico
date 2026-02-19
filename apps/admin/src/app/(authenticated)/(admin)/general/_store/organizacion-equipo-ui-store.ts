import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { TeamMember } from '../_types'

/**
 * Escribe cambios de miembros del equipo al change-journal.
 *
 * Mapea EntityOperations a entradas de journal con estructura:
 * - section: 'organizacion_equipo' (scope lógico)
 * - scopeKey: Para ADD/DELETE: 'organizacion_equipo:member-123'
 * - scopeKey: Para UPDATE: 'organizacion_equipo:member-123:field'
 * - payload: Operación transformada a journal format
 *
 * @param operation - Operación individual sobre un TeamMember (ADD/UPDATE/DELETE)
 */
async function writeTeamJournal(
  operation: EntityOperation<TeamMember>
): Promise<void> {
  const section = JOURNAL_ENTITIES.ORGANIZACION_EQUIPO

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
 * Store de estado UI para el equipo de la organización.
 *
 * Usa Entity State Factory en modo colección (no singleton).
 * Maneja operaciones CRUD sobre miembros del equipo con:
 * - Estado normalizado (O(1) lookups)
 * - IDs temporales para miembros nuevos
 * - 3 capas: remoteData, appliedChanges, currentEdits
 */
export const useOrganizacionEquipoUIStore =
  createEntityUIStateStore<TeamMember>({
    sectionName: JOURNAL_ENTITIES.ORGANIZACION_EQUIPO,
    idField: 'id',
    writeToJournal: writeTeamJournal
  })

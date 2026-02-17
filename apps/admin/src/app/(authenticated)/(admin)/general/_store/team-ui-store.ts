import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { TeamMember } from '../_types'
import { TEAM_SECTION_NAME } from '../_constants'

/**
 * Escribe cambios de miembros del equipo al change-journal.
 *
 * Mapea EntityOperations a entradas de journal con estructura:
 * - section: 'equipo' (scope lógico)
 * - scopeKey: 'equipo:member-123'
 * - payload: Operación transformada a journal format
 *
 * @param operation - Operación individual sobre un TeamMember (ADD/UPDATE/DELETE)
 */
async function writeTeamJournal(operation: EntityOperation<TeamMember>) {
  const section = TEAM_SECTION_NAME
  const scopeKey = `${section}:${operation.id}`

  if (operation.type === 'ADD' && operation.data) {
    await writeEntry(section, scopeKey, {
      op: 'set',
      value: operation.data as TeamMember
    })
  } else if (operation.type === 'UPDATE' && operation.data) {
    await writeEntry(section, scopeKey, { op: 'patch', value: operation.data })
  } else if (operation.type === 'DELETE') {
    await writeEntry(section, scopeKey, { op: 'unset' })
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
export const useTeamUIStore = createEntityUIStateStore<TeamMember>({
  sectionName: TEAM_SECTION_NAME,
  idField: 'id',
  writeToJournal: writeTeamJournal
})

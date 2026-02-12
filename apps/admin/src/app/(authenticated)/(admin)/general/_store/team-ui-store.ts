import { createEntityUIStateStore } from '@/shared/ui-state'
import type { EntityOperation } from '@/shared/ui-state'
import { TeamMember } from '../_types'

/**
 * Función para escribir operaciones del equipo al journal.
 *
 * TODO: Conectar con el sistema de change-journal cuando esté implementado.
 * Por ahora solo loguea las operaciones a consola para debugging.
 *
 * @param operation - Operación individual sobre un TeamMember (ADD/UPDATE/DELETE)
 */
async function writeTeamJournal(operation: EntityOperation<TeamMember>) {
  console.log('[teamUIStore] Writing to journal:', operation)
  // TODO: Conectar con /shared/change-journal cuando esté implementado
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
  sectionName: 'equipo',
  idField: 'id',
  writeToJournal: writeTeamJournal
})

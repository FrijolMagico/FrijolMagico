import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { TeamMember } from '../_types'

export async function writeTeamJournal(
  operation: EntityOperation<TeamMember>
): Promise<void> {
  const section = JOURNAL_ENTITIES.ORGANIZACION_EQUIPO

  switch (operation.type) {
    case 'ADD':
      await writeEntry(section, `${section}:${operation.entityId}`, {
        op: 'set',
        value: operation.entity
      })
      break

    case 'UPDATE':
      if (operation.data) {
        for (const [field, value] of Object.entries(operation.data)) {
          await writeEntry(
            section,
            `${section}:${operation.entityId}:${field}`,
            {
              op: 'set',
              value
            }
          )
        }
      }
      break

    case 'DELETE':
      await writeEntry(section, `${section}:${operation.entityId}`, {
        op: 'unset'
      })
      break
  }
}

export const useOrganizacionEquipoUIStore =
  createEntityUIStateStore<TeamMember>()

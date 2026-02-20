import { EntityOperation } from '@/shared/ui-state/operation-log'
import { writeEntry } from '@/shared/change-journal/change-journal'

export async function writeOperationIntoJournal<T>(
  operations: EntityOperation<T>[],
  section: string
): Promise<void> {
  for (const operation of operations) {
    switch (operation.type) {
      case 'ADD':
        await writeEntry(section, `${section}:${operation.data.id}`, {
          op: 'set',
          value: operation
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
}

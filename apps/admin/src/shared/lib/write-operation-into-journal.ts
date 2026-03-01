import { EntityOperation } from '@/shared/ui-state/operation-log'
import { writeEntry } from '@/shared/change-journal/'

export async function writeOperationIntoJournal<T>(
  operations: EntityOperation<T>[],
  section: string
): Promise<void> {
  for (const operation of operations) {
    switch (operation.type) {
      case 'ADD':
        {
          const result = await writeEntry(
            section,
            `${section}:${operation.data.id}`,
            {
              op: 'set',
              value: operation
            }
          )
          if (!result.success) {
            console.error(
              `[writeOperationIntoJournal] Failed to write ADD operation:`,
              result.error
            )
          }
        }
        break

      case 'UPDATE':
        if (operation.data) {
          for (const [field, value] of Object.entries(operation.data)) {
            const result = await writeEntry(
              section,
              `${section}:${operation.id}:${field}`,
              {
                op: 'set',
                value
              }
            )
            if (!result.success) {
              console.error(
                `[writeOperationIntoJournal] Failed to write UPDATE operation for field ${field}:`,
                result.error
              )
            }
          }
        }
        break

      case 'DELETE':
        {
          const result = await writeEntry(
            section,
            `${section}:${operation.id}`,
            { op: 'unset' }
          )
          if (!result.success) {
            console.error(
              `[writeOperationIntoJournal] Failed to write DELETE operation:`,
              result.error
            )
          }
        }
        break

      case 'RESTORE':
        {
          const result = await writeEntry(
            section,
            `${section}:${operation.id}`,
            {
              op: 'restore'
            }
          )
          if (!result.success) {
            console.error(
              `[writeOperationIntoJournal] Failed to write RESTORE operation:`,
              result.error
            )
          }
        }
        break
    }
  }
}

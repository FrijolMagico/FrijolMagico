'use client'

import type { ReactNode } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Toggle } from '@/shared/components/ui/toggle'
import { Table, TableBody, TableHeader } from '@/shared/components/ui/table'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

export interface DeletedListTableRowContext {
  onDelete: () => void
  onRestore: () => void
  isDeletedView: boolean
}

export interface DeletedListTableProps<TItem, TId extends number> {
  items: TItem[]
  columns: ReactNode
  renderRow: (item: TItem, context: DeletedListTableRowContext) => ReactNode
  emptyState?: ReactNode
  getId: (item: TItem) => TId
  onDelete: (id: TId) => void
  onRestore: (id: TId) => void
  isDeletedView: boolean
}

export function DeletedListTable<TItem, TId extends number>({
  items,
  columns,
  renderRow,
  emptyState,
  getId,
  onDelete,
  onRestore,
  isDeletedView
}: DeletedListTableProps<TItem, TId>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <Table>
      <TableHeader>{columns}</TableHeader>
      <TableBody>
        {items.map((item) => {
          const itemId = getId(item)

          return renderRow(item, {
            onDelete: () => onDelete(itemId),
            onRestore: () => onRestore(itemId),
            isDeletedView
          })
        })}
      </TableBody>
    </Table>
  )
}

export interface DeletedToggleProps {
  showDeleted: boolean
  onToggle: () => void
  deletedCount: number
}

export function DeletedToggle({
  showDeleted,
  onToggle,
  deletedCount
}: DeletedToggleProps) {
  return (
    <Toggle
      pressed={showDeleted}
      aria-pressed={showDeleted}
      aria-label={showDeleted ? 'Ocultar eliminados' : 'Mostrar eliminados'}
      variant='outline'
      onPressedChange={() => onToggle()}
      className='gap-2'
    >
      {showDeleted ? <IconEyeOff /> : <IconEye />}
      <span>{showDeleted ? 'Ocultar eliminados' : 'Mostrar eliminados'}</span>
      {deletedCount > 0 ? (
        <Badge variant={showDeleted ? 'secondary' : 'outline'}>
          {deletedCount}
        </Badge>
      ) : null}
    </Toggle>
  )
}

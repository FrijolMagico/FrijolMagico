'use client'

import type { ReactNode } from 'react'

import { Table, TableBody, TableHeader } from '@/shared/components/ui/table'

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

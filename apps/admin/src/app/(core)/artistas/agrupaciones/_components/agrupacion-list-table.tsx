'use client'

import { DeletedListTable } from '@/shared/components/deleted-toggle-list'
import { TableHead, TableRow } from '@/shared/components/ui/table'
import type { AgrupacionRow, DeletedAgrupacionRow } from '../_types/agrupacion'
import { AgrupacionListRow } from './agrupacion-list-row'

interface AgrupacionListTableProps {
  items: Array<AgrupacionRow | DeletedAgrupacionRow>
  isDeleted: boolean
  onDelete: (id: number) => void
  onRestore: (id: number) => void
  emptyState?: React.ReactNode
}

export function AgrupacionListTable({
  items,
  isDeleted,
  onDelete,
  onRestore,
  emptyState
}: AgrupacionListTableProps) {
  return (
    <DeletedListTable
      items={items}
      getId={(item) => item.id}
      onDelete={onDelete}
      onRestore={onRestore}
      isDeletedView={isDeleted}
      emptyState={emptyState}
      columns={
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Miembros</TableHead>
          {isDeleted ? <TableHead>Eliminada</TableHead> : null}
          <TableHead>Acciones</TableHead>
        </TableRow>
      }
      renderRow={(item, context) => (
        <AgrupacionListRow
          key={item.id}
          item={item}
          isDeleted={context.isDeletedView}
          onDelete={context.onDelete}
          onRestore={context.onRestore}
        />
      )}
    />
  )
}

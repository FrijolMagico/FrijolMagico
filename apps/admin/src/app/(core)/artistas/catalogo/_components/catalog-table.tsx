'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { CatalogRow } from './catalog-row'
import type { CatalogListItem } from '../_types/catalog-list-item'

interface CatalogTableProps {
  items: CatalogListItem[]
  showDeleted: boolean
  onDelete: (id: number) => void
  onRestore: (id: number) => void
  onClearFilters: () => void
  isPending: boolean
  canReorder?: boolean
}

export function CatalogTable({
  items,
  showDeleted,
  onDelete,
  onRestore,
  isPending,
  canReorder = true
}: CatalogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-12'></TableHead>
          <TableHead>Nombre</TableHead>
          {!showDeleted ? (
            <>
              <TableHead className='w-24'>Destacado</TableHead>
              <TableHead className='w-24'>Activo</TableHead>
            </>
          ) : (
            <TableHead className='w-48'>Eliminado</TableHead>
          )}
          <TableHead className='w-[5%]'></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <CatalogRow
            key={item.id}
            catalog={item}
            sortable={canReorder}
            isDeletedView={showDeleted}
            onDelete={() => onDelete(item.id)}
            onRestore={() => onRestore(item.id)}
            isPending={isPending}
          />
        ))}
      </TableBody>
    </Table>
  )
}

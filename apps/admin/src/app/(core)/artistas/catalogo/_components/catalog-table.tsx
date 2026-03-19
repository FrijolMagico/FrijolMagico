'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import { CatalogRow } from './catalog-row'
import type { CatalogListItem } from '../_types/catalog-list-item'
import { startTransition, useOptimistic } from 'react'
import { deleteCatalogAction } from '../_actions/delete-catalog.action'
import { toast } from 'sonner'

interface CatalogTableProps {
  items: CatalogListItem[]
  onClearFilters: () => void
  canReorder?: boolean
}

export function CatalogTable({
  items,
  onClearFilters,
  canReorder = true
}: CatalogTableProps) {
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (current, id: number) => current.filter((cat) => cat.id !== id)
  )

  if (optimisticItems.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: onClearFilters
        }}
      />
    )
  }

  const handleCatalogItemDelete = (id: number) => {
    startTransition(async () => {
      setOptimisticItems(id)
      try {
        const result = await deleteCatalogAction(id)
        if (result.success)
          toast.success('El artista del catálogo fue eliminado exitosamente')
      } catch (error) {
        toast.error(
          'Ocurrió un error al intentar eliminar al artista del catálogo'
        )
        console.error(error)
      }
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-12'></TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className='w-24'>Destacado</TableHead>
          <TableHead className='w-24'>Activo</TableHead>
          <TableHead className='w-[5%]'></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {optimisticItems.map((item) => (
          <CatalogRow
            key={item.id}
            catalog={item}
            sortable={canReorder}
            onDelete={handleCatalogItemDelete}
          />
        ))}
      </TableBody>
    </Table>
  )
}

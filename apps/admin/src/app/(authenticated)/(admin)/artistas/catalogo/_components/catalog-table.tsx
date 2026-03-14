'use client'

import type { RefObject } from 'react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'
import { useDragSort } from '@/shared/hooks/use-drag-sort'
import { CatalogRow } from './catalog-row'
import { Catalog } from '../_schemas/catalogo.schema'
import { Artist } from '../../_schemas/artista.schema'

interface CatalogTableProps {
  items: Catalog[]
  allItems: Catalog[]
  artists: Artist[]
  containerRef?: RefObject<HTMLDivElement | null>
  onPageChange?: (page: number) => void
  page?: number
  totalPages?: number
  onReorder: (id: number, newKey: string) => void
}

export function CatalogTable({
  items,
  allItems,
  artists,
  containerRef,
  onPageChange,
  page = 1,
  totalPages = 1,
  onReorder
}: CatalogTableProps) {
  const setFiltersCatalog = useCatalogFilterStore((s) => s.setFilters)

  const dndItems = allItems.map((item) => ({
    id: item.id,
    orderKey: item.orden
  }))

  const { dndContextProps } = useDragSort({
    items: dndItems,
    onReorder,
    containerRef,
    pagination:
      onPageChange && totalPages > 1
        ? { page, totalPages, onPageChange }
        : undefined
  })

  if (items.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: () => {
            setFiltersCatalog({ activo: null, destacado: null, search: '' })
          }
        }}
      />
    )
  }

  return (
    <DndContext {...dndContextProps}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-8'></TableHead>
            <TableHead className='w-12'></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className='w-24'>Destacado</TableHead>
            <TableHead className='w-24'>Activo</TableHead>
            <TableHead className='w-[5%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <CatalogRow
                key={item.id}
                catalog={item}
                artist={artists.find((a) => a.id === item.artistaId)}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}

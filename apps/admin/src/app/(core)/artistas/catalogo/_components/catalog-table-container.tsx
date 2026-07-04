'use client'

import type { CatalogListItem } from '../_types/catalog-list-item'
import { CatalogTable } from './catalog-table'

interface CatalogTableContainerProps {
  items: CatalogListItem[]
  showDeleted: boolean
  onDelete: (id: number) => void
  onRestore: (id: number) => void
  onClearFilters: () => void
  isPending: boolean
  canReorder?: boolean
}

export function CatalogTableContainer({
  items,
  showDeleted,
  onDelete,
  onRestore,
  onClearFilters,
  isPending,
  canReorder = true
}: CatalogTableContainerProps) {
  return (
    <CatalogTable
      items={items}
      showDeleted={showDeleted}
      onDelete={onDelete}
      onRestore={onRestore}
      onClearFilters={onClearFilters}
      isPending={isPending}
      canReorder={canReorder}
    />
  )
}

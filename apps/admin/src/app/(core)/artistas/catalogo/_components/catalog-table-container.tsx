'use client'

import type { CatalogListItem } from '../_types/catalog-list-item'
import { CatalogTable } from './catalog-table'

interface CatalogTableContainerProps {
  catalog: CatalogListItem[]
  onClearFilters: () => void
  canReorder?: boolean
}

export function CatalogTableContainer({
  catalog,
  onClearFilters,
  canReorder = true
}: CatalogTableContainerProps) {
  return (
    <CatalogTable
      items={catalog}
      onClearFilters={onClearFilters}
      canReorder={canReorder}
    />
  )
}

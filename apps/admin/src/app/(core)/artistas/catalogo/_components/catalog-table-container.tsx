'use client'

import type { PaginatedResponse } from '@/shared/types/pagination'
import type { CatalogListItem } from '../_types/catalog-list-item'
import { CatalogTable } from './catalog-table'
import { PaginationControls } from '@/shared/components/pagination-controls'

interface CatalogTableContainerProps {
  catalog: CatalogListItem[]
  pagination: PaginatedResponse<CatalogListItem>
  onPageChange: (page: number) => void
  onClearFilters: () => void
  canReorder?: boolean
}

export function CatalogTableContainer({
  catalog,
  pagination,
  onPageChange,
  onClearFilters,
  canReorder = true
}: CatalogTableContainerProps) {
  return (
    <>
      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.total}
        onPageChange={onPageChange}
        itemNoun='artistas'
      />

      <div className='rounded-lg border'>
        <CatalogTable
          items={catalog}
          onClearFilters={onClearFilters}
          canReorder={canReorder}
        />
      </div>

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.total}
        onPageChange={onPageChange}
        itemNoun='artistas'
      />
    </>
  )
}

'use client'

import { useRef } from 'react'
import type { Catalog } from '../_schemas/catalogo.schema'
import type { Artist } from '../../_schemas/artista.schema'
import { useCatalogList } from '../_hooks/use-catalog-list'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { reorderCatalogAction } from '../_actions/reorder-catalog.action'
import { CatalogTable } from './catalog-table'
import { PaginationControls } from '@/shared/components/pagination-controls'

interface CatalogTableContainerProps {
  catalog: Catalog[]
  artists: Artist[]
}

export function CatalogTableContainer({
  catalog,
  artists
}: CatalogTableContainerProps) {
  const resolvedRef = useRef<HTMLDivElement>(null)

  const { paginatedItems, filteredItems, totalFilteredItems } = useCatalogList(
    catalog,
    artists
  )

  const page = useCatalogPaginationStore((s) => s.page)
  const pageSize = useCatalogPaginationStore((s) => s.pageSize)
  const setPage = useCatalogPaginationStore((s) => s.setPage)

  const totalPages = Math.max(1, Math.ceil(totalFilteredItems / pageSize))

  const handleReorder = async (id: number, newKey: string) => {
    await reorderCatalogAction([{ id, orden: newKey }])
  }

  return (
    <>
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={totalFilteredItems}
        onPageChange={setPage}
        itemNoun='artistas'
      />

      <div ref={resolvedRef} className='rounded-lg border'>
        <CatalogTable
          items={paginatedItems}
          allItems={filteredItems}
          artists={artists}
          onReorder={handleReorder}
          containerRef={resolvedRef}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={totalFilteredItems}
        onPageChange={setPage}
        itemNoun='artistas'
      />
    </>
  )
}

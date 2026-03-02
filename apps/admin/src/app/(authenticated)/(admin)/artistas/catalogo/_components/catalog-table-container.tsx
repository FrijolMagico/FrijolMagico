'use client'

import { Card } from '@/shared/components/ui/card'
import { CatalogPagination } from './catalog-pagination'
import { CatalogTable } from './catalog-table'
import { memo, useRef, useCallback } from 'react'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useRouter } from 'next/navigation'

interface CatalogTableContainerProps {
  handleFiltersChange: (filters: {
    activo?: boolean | null
    destacado?: boolean | null
    search?: string
  }) => void
}

export const CatalogTableContainer = memo(function CatalogTableContainer({
  handleFiltersChange
}: CatalogTableContainerProps) {
  const router = useRouter()
  const setPage = useCatalogPaginationStore((s) => s.setPage)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      // Read current search params at call time to avoid a reactive subscription
      // that would cause this component to re-render on every URL change.
      const params = new URLSearchParams(window.location.search)
      if (newPage === 1) {
        params.delete('page')
      } else {
        params.set('page', String(newPage))
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [setPage, router]
  )

  return (
    <>
      <CatalogPagination onPageChange={handlePageChange} />

      <Card ref={tableContainerRef} className='py-0'>
        <CatalogTable
          handleFiltersChange={handleFiltersChange}
          containerRef={tableContainerRef}
          onPageChange={handlePageChange}
        />
      </Card>

      <CatalogPagination onPageChange={handlePageChange} />
    </>
  )
})

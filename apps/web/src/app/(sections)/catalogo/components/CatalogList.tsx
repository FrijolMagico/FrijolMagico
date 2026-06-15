'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { CatalogArtist } from '../types/catalog'
import { CatalogArtistCard } from './CatalogArtistCard'
import { useCatalogFiltersStore } from '../store/useCatalogFiltersStore'
import { Pagination } from '@/components/ui/Pagination'
import { CatalogCardLoader } from './CatalogSkeletonLoaders'
import { filterCatalog } from '../utils/filterUtils'
import { getPageFromURL, updatePageURL } from '../utils/urlFilters'

interface CatalogListProps {
  catalog: CatalogArtist[]
}

export const CatalogList: React.FC<CatalogListProps> = ({ catalog }) => {
  const filters = useCatalogFiltersStore((state) => state.filters)
  const isReady = useCatalogFiltersStore((state) => state.isReady)
  const [rawPage, setRawPage] = useState(() => getPageFromURL())
  const itemsPerPage = 18

  // Filter the catalog based on search and filters
  const filteredCatalog = useMemo(() => {
    return filterCatalog(catalog, filters)
  }, [catalog, filters])

  // Derive effective page in render — React-recommended pattern
  // (avoids unnecessary setState and double-rendering)
  const totalItems = filteredCatalog.length
  const maxPage = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const currentPage = rawPage > maxPage ? maxPage : rawPage

  // When the effective page is clamped (filters narrowed results),
  // sync the browser URL. This is a legitimate DOM side effect.
  const urlSynced = useRef(-1)
  useEffect(() => {
    if (urlSynced.current !== currentPage) {
      urlSynced.current = currentPage
      updatePageURL(currentPage)
    }
  }, [currentPage])

  // Get current items
  const currentItems = useMemo<CatalogArtist[]>(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredCatalog.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCatalog, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setRawPage(page)
    updatePageURL(page)
  }

  // Only show pagination if there are items to paginate
  const showPagination = totalItems > itemsPerPage

  if (!isReady) return <CatalogCardLoader />

  return (
    <div className='w-full'>
      {showPagination && (
        <div className='mb-4'>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className='justify-center'
          />
        </div>
      )}

      <ul className='mx-auto flex w-full max-w-[calc(var(--card-width)*3+2rem)] flex-wrap justify-center gap-4 py-4 [--card-width:24rem]'>
        {currentItems.map((item) => (
          <CatalogArtistCard key={item.id} {...item} />
        ))}
        {filteredCatalog.length === 0 && (
          <li className='text-mutedbackground w-full py-8 text-center'>
            No se encontraron artistas que coincidan con los filtros
            seleccionados.
          </li>
        )}
      </ul>

      {showPagination && (
        <div className='mt-6'>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className='justify-center'
          />
        </div>
      )}
    </div>
  )
}

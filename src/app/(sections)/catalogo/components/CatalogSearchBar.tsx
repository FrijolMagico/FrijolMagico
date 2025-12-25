'use client'

import { useCallback, useRef } from 'react'

import { useCatalogFiltersStore } from '../store/useCatalogFiltersStore'
import { CatalogSearchBarLoader } from './CatalogSkeletonLoaders'
import { useAnalytics } from '@/components/analytics/useAnalytics'

export const CatalogSearchBar = () => {
  const filters = useCatalogFiltersStore((state) => state.filters)
  const setFilters = useCatalogFiltersStore((state) => state.setFilters)
  const isReady = useCatalogFiltersStore((state) => state.isReady)

  const { trackCatalogSearch } = useAnalytics()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (isReady) {
        const searchValue = e.target.value
        setFilters({ search: searchValue })

        // Debounce tracking to avoid tracking every keystroke
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }

        if (searchValue.trim().length >= 2) {
          debounceRef.current = setTimeout(() => {
            trackCatalogSearch({
              search_term: searchValue.trim(),
            })
          }, 1000)
        }
      }
    },
    [setFilters, isReady, trackCatalogSearch],
  )

  if (!isReady) return <CatalogSearchBarLoader />

  return (
    <input
      type='text'
      value={filters.search}
      onChange={handleInput}
      placeholder='Busca a tu artista favorito/a'
      aria-label='Buscar artista'
      className='border-fm-green/30 focus:ring-fm-green/50 text-fm-black h-8 w-full max-w-md rounded-xl border border-dashed px-3 text-sm focus:border-transparent focus:ring-2 focus:outline-none'
    />
  )
}

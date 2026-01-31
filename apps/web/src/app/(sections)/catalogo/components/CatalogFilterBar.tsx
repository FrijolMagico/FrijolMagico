'use client'

import { useState, useCallback } from 'react'

import { CatalogFilter } from './CatalogFilter'
import { normalizeString } from '@/utils/utils'
import { useCatalogFiltersStore } from '../store/useCatalogFiltersStore'
import { CatalogFiltersBarLoader } from './CatalogSkeletonLoaders'
import { urlHasFilters } from '../utils/urlFilters'
import { getFiltersData } from '../utils/filterUtils'
import { FILTER_KEYS } from '../constants/filterConstants'
import { useAnalytics } from '@/components/analytics/useAnalytics'

import type { CatalogArtist } from '../types/catalog'
import type { CatalogSelectionFilterKey } from '../types/filters'

interface CatalogFilterBarProps {
  catalogData: CatalogArtist[]
}

export const CatalogFilterBar = ({ catalogData }: CatalogFilterBarProps) => {
  const [filtersOpen, setFiltersOpen] = useState<
    Record<CatalogSelectionFilterKey, boolean>
  >({
    city: false,
    category: false,
    country: false,
  })

  const filters = useCatalogFiltersStore((state) => state.filters)
  const setFilters = useCatalogFiltersStore((state) => state.setFilters)
  const isReady = useCatalogFiltersStore((state) => state.isReady)

  const { trackFilterApplied } = useAnalytics()

  const toggleFilter = useCallback((filterKey: CatalogSelectionFilterKey) => {
    setFiltersOpen((prev) => {
      return Object.keys(prev).reduce(
        (acc, curr) => {
          acc[curr as CatalogSelectionFilterKey] =
            curr === filterKey ? !prev[filterKey] : false
          return acc
        },
        {} as Record<CatalogSelectionFilterKey, boolean>,
      )
    })
  }, [])

  const handleSelect = useCallback(
    (filterKey: CatalogSelectionFilterKey, value: string) => {
      if (!isReady) return

      const current = filters[filterKey]
      const normalizedValue = normalizeString(value)
      const alreadySelected = current
        .map(normalizeString)
        .includes(normalizedValue)

      // Track filter applied (only when adding, not removing)
      if (!alreadySelected) {
        trackFilterApplied({
          filter_type: filterKey,
          filter_value: value,
        })
      }

      // if already selected, remove it, otherwise add it
      setFilters({
        [filterKey]: alreadySelected
          ? current.filter((v) => normalizeString(v) !== normalizedValue)
          : [...current, value],
      })
    },
    [filters, setFilters, isReady, trackFilterApplied],
  )

  const handleClear = useCallback(
    (filterKey: CatalogSelectionFilterKey) => {
      if (!isReady) return
      setFilters({ [filterKey]: [] })
    },
    [setFilters, isReady],
  )

  if (!isReady) return <CatalogFiltersBarLoader />

  const cityFilterData = getFiltersData(catalogData, FILTER_KEYS.city)
  const categoryFilterData = getFiltersData(catalogData, FILTER_KEYS.category)
  const countryFilterData = getFiltersData(catalogData, FILTER_KEYS.country)

  return (
    <div className='flex shrink-0 flex-wrap justify-center gap-4'>
      <CatalogFilter
        title='Ciudad'
        filterKey='city'
        options={cityFilterData}
        isOpen={filtersOpen.city}
        onToggle={toggleFilter}
        selectedValues={filters.city}
        onSelect={handleSelect}
        onClear={handleClear}
      />
      <CatalogFilter
        title='País'
        filterKey='country'
        options={countryFilterData}
        isOpen={filtersOpen.country}
        onToggle={toggleFilter}
        selectedValues={filters.country}
        onSelect={handleSelect}
        onClear={handleClear}
      />
      <CatalogFilter
        title='Disciplina'
        filterKey='category'
        options={categoryFilterData}
        isOpen={filtersOpen.category}
        onToggle={toggleFilter}
        selectedValues={filters.category}
        onSelect={handleSelect}
        onClear={handleClear}
      />
      {urlHasFilters() && (
        <button
          onClick={() =>
            setFilters({ city: [], category: [], search: '', country: [] })
          }
          className='border-fm-orange/30 bg-fm-orange/80 text-fm-white hover:bg-fm-orange flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-1.5 text-sm transition-colors'>
          <span>Limpiar filtros</span>
        </button>
      )}
    </div>
  )
}

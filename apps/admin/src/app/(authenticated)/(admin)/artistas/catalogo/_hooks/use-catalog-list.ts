'use client'

import { useMemo } from 'react'
import type { Artist } from '../../_schemas/artista.schema'
import type { Catalog } from '../_schemas/catalogo.schema'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { usePaginatedSlice } from '@/shared/hooks/use-paginated-slice'

/** Catalog item extended with artist name fields for search */
interface MergedCatalogItem extends Catalog {
  nombre: string
  pseudonimo: string
}

const byOrden = (a: MergedCatalogItem, b: MergedCatalogItem) =>
  a.orden.localeCompare(b.orden)

export function useCatalogList(
  catalog: Catalog[],
  artists: Artist[]
): {
  paginatedItems: Catalog[]
  filteredItems: Catalog[]
  totalFilteredItems: number
  artistMap: Map<number, Artist>
} {
  const filters = useCatalogFilterStore((s) => s.filters)

  // O(1) artist lookup
  const artistMap = useMemo(
    () => new Map(artists.map((a) => [a.id, a])),
    [artists]
  )

  // Extend each catalog item with artist name fields for search
  const mergedItems = useMemo<MergedCatalogItem[]>(
    () =>
      catalog.map((cat) => {
        const art = artistMap.get(cat.artistaId)
        return {
          ...cat,
          nombre: art?.nombre ?? '',
          pseudonimo: art?.pseudonimo ?? ''
        }
      }),
    [catalog, artistMap]
  )

  // Build active filter predicates
  const activeFilters = useMemo(() => {
    const predicates: Array<(item: MergedCatalogItem) => boolean> = []
    if (filters.activo !== null) {
      predicates.push((item) => item.activo === filters.activo)
    }
    if (filters.destacado !== null) {
      predicates.push((item) => item.destacado === filters.destacado)
    }
    return predicates
  }, [filters.activo, filters.destacado])

  const {
    paginatedItems: paginatedMerged,
    filteredItems: filteredMerged,
    totalFilteredItems
  } = usePaginatedSlice<MergedCatalogItem, 'id'>({
    items: mergedItems,
    searchFields: ['nombre', 'pseudonimo'],
    searchTerm: filters.search,
    filters: activeFilters,
    sortFn: byOrden,
    paginationStore: useCatalogPaginationStore,
    idField: 'id'
  })

  // Map back to plain Catalog[] — strip merged name fields via catalogById lookup
  const catalogById = useMemo(
    () => new Map(catalog.map((c) => [c.id, c])),
    [catalog]
  )

  const paginatedItems = useMemo(
    () =>
      paginatedMerged
        .map((item) => catalogById.get(item.id))
        .filter((c): c is Catalog => c !== undefined),
    [paginatedMerged, catalogById]
  )

  const filteredItems = useMemo(
    () =>
      filteredMerged
        .map((item) => catalogById.get(item.id))
        .filter((c): c is Catalog => c !== undefined),
    [filteredMerged, catalogById]
  )

  return { paginatedItems, filteredItems, totalFilteredItems, artistMap }
}

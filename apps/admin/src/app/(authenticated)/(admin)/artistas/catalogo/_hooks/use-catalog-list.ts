import { useMemo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useCatalogProjectionStore } from '../_store/catalog-ui-store'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'

export function useCatalogList(): {
  paginatedIds: string[]
  totalFilteredItems: number
} {
  const filters = useCatalogFilterStore((s) => s.filters)
  const page = useCatalogPaginationStore((s) => s.page)
  const pageSize = useCatalogPaginationStore((s) => s.pageSize)

  const { allIds, byId: catalogById } = useCatalogProjectionStore(
    useShallow((s) => ({ allIds: s.allIds, byId: s.byId }))
  )
  const artistById = useArtistsProjectionStore((s) => s.byId)

  const listData = useMemo(() => {
    return allIds.map((id) => {
      const cat = catalogById[id]
      const art = artistById[cat.artistaId]

      return {
        id: cat.id,
        artistaId: cat.artistaId,
        orden: cat.orden,
        activo: cat.activo,
        destacado: cat.destacado,
        nombre: art?.nombre ?? '',
        pseudonimo: art?.pseudonimo ?? ''
      }
    })
  }, [allIds, catalogById, artistById])

  const filteredAndSortedIds = useMemo(() => {
    let filtered = listData

    if (filters.activo !== null) {
      filtered = filtered.filter((item) => item.activo === filters.activo)
    }

    if (filters.destacado !== null) {
      filtered = filtered.filter((item) => item.destacado === filters.destacado)
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter((item) => {
        const nombre = (item.nombre || '').toLowerCase()
        const pseudonimo = (item.pseudonimo || '').toLowerCase()
        return nombre.includes(term) || pseudonimo.includes(term)
      })
    }

    filtered.sort((a, b) => a.orden.localeCompare(b.orden))

    return filtered.map((i) => i.id)
  }, [listData, filters])

  useEffect(() => {
    useCatalogPaginationStore
      .getState()
      .setTotalItems(filteredAndSortedIds.length)
  }, [filteredAndSortedIds.length])

  const paginatedIds = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedIds.slice(start, start + pageSize)
  }, [filteredAndSortedIds, page, pageSize])

  return { paginatedIds, totalFilteredItems: filteredAndSortedIds.length }
}

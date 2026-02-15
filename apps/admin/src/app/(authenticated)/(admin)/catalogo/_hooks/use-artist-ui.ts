import { useCallback, useMemo } from 'react'
import { useArtistUIStore } from '../_store/artist-ui-store'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { CatalogArtist, CatalogFilters } from '../_types'

function filterArtists(
  artists: CatalogArtist[],
  filters: CatalogFilters
): CatalogArtist[] {
  return artists.filter((artist) => {
    if (filters.activo !== null && artist.activo !== filters.activo) {
      return false
    }

    if (filters.destacado !== null && artist.destacado !== filters.destacado) {
      return false
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      const nombre = (artist.nombre || '').toLowerCase()
      const pseudonimo = (artist.pseudonimo || '').toLowerCase()
      if (!nombre.includes(term) && !pseudonimo.includes(term)) {
        return false
      }
    }

    return true
  })
}

function sortByOrden(artists: CatalogArtist[]): CatalogArtist[] {
  return [...artists].sort((a, b) => {
    if (a.orden < b.orden) return -1
    if (a.orden > b.orden) return 1
    return 0
  })
}

export function useArtistUI() {
  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  const { selectById, updateOne } = useArtistUIStore.getState()

  const reorder = useCallback(
    (draggedArtistId: number, dropTargetId: number) => {
      if (!dropTargetId) return

      const artists = useArtistUIStore.getState().selectAll()
      const sortedArtists = sortByOrden(artists)

      const draggedNewIndex = sortedArtists.findIndex(
        (item) => item.artistaId === draggedArtistId
      )
      const dropTargetIndex = sortedArtists.findIndex(
        (item) => item.artistaId === dropTargetId
      )

      if (draggedNewIndex === -1 || dropTargetIndex === -1) return

      const movingDown = draggedNewIndex < dropTargetIndex

      let prevItem: CatalogArtist | undefined
      let nextItem: CatalogArtist | undefined

      if (movingDown) {
        prevItem = sortedArtists[dropTargetIndex]
        nextItem = sortedArtists[dropTargetIndex + 1]
      } else {
        prevItem = sortedArtists[dropTargetIndex - 1]
        nextItem = sortedArtists[dropTargetIndex]
      }

      const prevOrder = prevItem?.orden ?? null
      const nextOrder = nextItem?.orden ?? null

      if (prevOrder && nextOrder && prevOrder >= nextOrder) {
        console.error('Invalid neighbor orden:', prevOrder, '>=', nextOrder)
        return
      }

      let newOrden: string
      try {
        newOrden = generateKeyBetween(prevOrder, nextOrder)
      } catch (e) {
        console.error('Error generating key', e)
        if (!prevOrder && nextOrder) newOrden = nextOrder + 'Z'
        else if (prevOrder && !nextOrder) newOrden = prevOrder + 'm'
        else newOrden = 'a0'
      }

      const currentEntity = selectById(draggedArtistId)
      if (currentEntity && newOrden !== currentEntity.orden) {
        updateOne(draggedArtistId, { orden: newOrden })
      }
    },
    [selectById, updateOne] // ✅ OK - getState() siempre da estado fresco
  )

  const handleDragStart = useCallback(
    (id: string) => {
      // ✅ Consistente con tipos
      startDrag(Number(id)) // Convierte aquí si startDrag necesita number
    },
    [startDrag]
  )

  const handleDragEnd = useCallback(() => {
    endDrag()
  }, [endDrag])

  return {
    reorder,
    handleDragStart,
    handleDragEnd
  }
}

// This need to be the main source of all related to the visibility of the list items
export function useVisibleArtists(): {
  visibleArtists: CatalogArtist[]
  totalCount: number
} {
  const { entities, ids } = useArtistUIStore(
    useShallow((s) => {
      const effective = s.getEffectiveData()
      return {
        entities: effective.entities,
        ids: effective.ids
      }
    })
  )

  const filters = useCatalogViewStore((s) => s.filters)
  const page = useCatalogPaginationStore((s) => s.page)
  const pageSize = useCatalogPaginationStore((s) => s.pageSize)

  const allArtists = useMemo(
    () => ids.map((id) => entities[id]).filter(Boolean),
    [entities, ids]
  )

  const filteredArtists = useMemo(
    () => filterArtists(allArtists, filters),
    [allArtists, filters]
  )

  const visibleArtists = useMemo(() => {
    const sorted = sortByOrden(filteredArtists)
    const startIndex = (page - 1) * pageSize
    return sorted.slice(startIndex, startIndex + pageSize)
  }, [filteredArtists, page, pageSize])

  return {
    visibleArtists,
    totalCount: filteredArtists.length
  }
}

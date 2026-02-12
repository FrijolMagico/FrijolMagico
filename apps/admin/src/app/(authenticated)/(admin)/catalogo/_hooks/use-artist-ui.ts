import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useArtistUIStore } from '../_store/artist-ui-store'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
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

  // ✅ Subscribe to raw state, not computed result
  const { remoteData, appliedChanges, currentEdits } = useArtistUIStore(
    useShallow((s) => ({
      remoteData: s.remoteData,
      appliedChanges: s.appliedChanges,
      currentEdits: s.currentEdits
    }))
  )

  // ✅ Compute effective data and array in component with useMemo
  const artists = useMemo(() => {
    const effectiveData = useArtistUIStore.getState().getEffectiveData()
    return effectiveData.ids
      .map((id) => effectiveData.entities[id])
      .filter(Boolean)
  }, [remoteData, appliedChanges, currentEdits])

  const reorder = useCallback(
    (newOrder: CatalogArtist[], draggedArtistId: number) => {
      const draggedNewIndex = newOrder.findIndex(
        (item) => item.artistaId === draggedArtistId
      )
      if (draggedNewIndex === -1) return

      const prevItem = newOrder[draggedNewIndex - 1]
      const nextItem = newOrder[draggedNewIndex + 1]

      const prevOrder = prevItem?.orden ?? null
      const nextOrder = nextItem?.orden ?? null

      let newOrden: string
      try {
        newOrden = generateKeyBetween(prevOrder, nextOrder)
      } catch (e) {
        console.error('Error generating key', e)
        if (!prevOrder && nextOrder) newOrden = nextOrder + 'Z'
        else if (prevOrder && !nextOrder) newOrden = prevOrder + 'm'
        else newOrden = 'a0'
      }

      const currentEntity = useArtistUIStore
        .getState()
        .selectById(String(draggedArtistId))

      if (currentEntity && newOrden !== currentEntity.orden) {
        useArtistUIStore
          .getState()
          .updateOne(String(draggedArtistId), { orden: newOrden })
      }
    },
    []
  )

  const handleDragStart = useCallback(
    (id: number) => {
      startDrag(id)
    },
    [startDrag]
  )

  const handleDragEnd = useCallback(() => {
    endDrag()
  }, [endDrag])

  // ✅ Get action methods from store (stable references via getState)
  const { setRemoteData, addOne, updateOne, removeOne, commitCurrentEdits } =
    useArtistUIStore.getState()

  return {
    artists,
    hasChanges: useArtistUIStore(useShallow((s) => s.getHasChanges())),
    hasUnsavedEdits: useArtistUIStore(
      useShallow((s) => s.getHasUnsavedEdits())
    ),

    setRemoteData,
    addOne,
    updateOne,
    removeOne,
    commitCurrentEdits,
    reorder,

    handleDragStart,
    handleDragEnd
  }
}

export function useFilteredArtists(): CatalogArtist[] {
  // ✅ Subscribe to raw state, compute effective data in useMemo
  const { remoteData, appliedChanges, currentEdits } = useArtistUIStore(
    useShallow((s) => ({
      remoteData: s.remoteData,
      appliedChanges: s.appliedChanges,
      currentEdits: s.currentEdits
    }))
  )
  const filters = useCatalogViewStore((s) => s.filters)

  const filteredArtists = useMemo(() => {
    const { entities, ids } = useArtistUIStore.getState().getEffectiveData()
    const allArtists = ids.map((id) => entities[id]).filter(Boolean)
    return filterArtists(allArtists, filters)
  }, [remoteData, appliedChanges, currentEdits, filters])

  return filteredArtists
}

export function useVisibleArtists(): CatalogArtist[] {
  const filtered = useFilteredArtists()
  const page = useCatalogViewStore((s) => s.page)
  const pageSize = useCatalogViewStore((s) => s.pageSize)

  const visibleArtists = useMemo(() => {
    const sorted = sortByOrden(filtered)
    const startIndex = (page - 1) * pageSize
    return sorted.slice(startIndex, startIndex + pageSize)
  }, [filtered, page, pageSize])

  return visibleArtists
}

export function useFilteredArtistCount(): number {
  return useFilteredArtists().length
}

export function useArtistById(id: number) {
  return useArtistUIStore(useShallow((state) => state.selectById(String(id))))
}

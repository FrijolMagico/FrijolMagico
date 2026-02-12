import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useArtistUIStore } from '../_store/artist-ui-store'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { CatalogArtist } from '../_types'

export function useArtistUI() {
  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  const store = useArtistUIStore()

  useArtistUIStore(
    useShallow((s) => ({
      remoteData: s.remoteData,
      appliedChanges: s.appliedChanges,
      currentEdits: s.currentEdits
    }))
  )

  const artists = useMemo(() => {
    const effectiveData = store.getEffectiveData()
    return effectiveData.ids
      .map((id) => effectiveData.entities[id])
      .filter(Boolean)
      .sort((a, b) => {
        if (a.orden < b.orden) return -1
        if (a.orden > b.orden) return 1
        return 0
      })
  }, [store])

  const reorder = useCallback(
    (newOrder: CatalogArtist[], draggedArtistId: number) => {
      // Find the dragged item in the new visual order provided by DnD
      const draggedNewIndex = newOrder.findIndex(
        (item) => item.artistaId === draggedArtistId
      )
      if (draggedNewIndex === -1) return

      // Get neighbors in the new order
      const prevItem = newOrder[draggedNewIndex - 1]
      const nextItem = newOrder[draggedNewIndex + 1]

      const prevOrder = prevItem?.orden ?? null
      const nextOrder = nextItem?.orden ?? null

      // Generate new key
      let newOrden: string
      try {
        newOrden = generateKeyBetween(prevOrder, nextOrder)
      } catch (e) {
        console.error('Error generating key', e)
        // Fallback
        if (!prevOrder && nextOrder) newOrden = nextOrder + 'Z'
        else if (prevOrder && !nextOrder) newOrden = prevOrder + 'm'
        else newOrden = 'a0'
      }

      // Only update if the order actually changed
      // We get the current entity state directly from store to verify
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

  return {
    // Selectors
    artists,
    hasChanges: useArtistUIStore(useShallow((s) => s.getHasChanges())),
    hasUnsavedEdits: useArtistUIStore(
      useShallow((s) => s.getHasUnsavedEdits())
    ),

    // Actions
    setRemoteData: useArtistUIStore.getState().setRemoteData,
    addOne: useArtistUIStore.getState().addOne,
    updateOne: useArtistUIStore.getState().updateOne,
    removeOne: useArtistUIStore.getState().removeOne,
    commitCurrentEdits: useArtistUIStore.getState().commitCurrentEdits,
    reorder,

    // UI specific
    handleDragStart,
    handleDragEnd
  }
}

export function useVisibleArtists() {
  const page = useCatalogViewStore((s) => s.page)
  const pageSize = useCatalogViewStore((s) => s.pageSize)

  const store = useArtistUIStore()

  useArtistUIStore(
    useShallow((s) => ({
      remoteData: s.remoteData,
      appliedChanges: s.appliedChanges,
      currentEdits: s.currentEdits
    }))
  )

  const visibleArtists = useMemo(() => {
    const effectiveData = store.getEffectiveData()

    const sorted = effectiveData.ids
      .map((id) => effectiveData.entities[id])
      .filter(Boolean)
      .sort((a, b) => {
        if (a.orden < b.orden) return -1
        if (a.orden > b.orden) return 1
        return 0
      })

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sorted.slice(startIndex, endIndex)
  }, [page, pageSize, store])

  return visibleArtists
}

export function useArtistById(id: number) {
  return useArtistUIStore(useShallow((state) => state.selectById(String(id))))
}

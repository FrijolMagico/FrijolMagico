import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useArtistaUIStore } from '../_store/artist-ui-store'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { CatalogArtist } from '../_types'

export function useArtistaUI() {
  const store = useArtistaUIStore()
  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  // Select and sort artists by 'orden' for UI display
  const artistas = useArtistaUIStore(
    useShallow((s) =>
      s.selectAll().sort((a, b) => {
        if (a.orden < b.orden) return -1
        if (a.orden > b.orden) return 1
        return 0
      })
    )
  )

  const reorder = useCallback(
    (newOrder: CatalogArtist[], draggedArtistaId: number) => {
      // Find the dragged item in the new visual order provided by DnD
      const draggedNewIndex = newOrder.findIndex(
        (item) => item.artistaId === draggedArtistaId
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
      const currentEntity = useArtistaUIStore
        .getState()
        .selectById(String(draggedArtistaId))

      if (currentEntity && newOrden !== currentEntity.orden) {
        store.updateOne(String(draggedArtistaId), { orden: newOrden })
      }
    },
    [store]
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
    artistas,
    hasChanges: useArtistaUIStore(useShallow((s) => s.getHasChanges())),
    hasUnsavedEdits: useArtistaUIStore(
      useShallow((s) => s.getHasUnsavedEdits())
    ),

    // Actions
    setRemoteData: store.setRemoteData,
    addOne: store.addOne,
    updateOne: store.updateOne,
    removeOne: store.removeOne,
    commitCurrentEdits: store.commitCurrentEdits,
    reorder,

    // UI specific
    handleDragStart,
    handleDragEnd
  }
}

export function useArtistaById(id: number) {
  return useArtistaUIStore(useShallow((state) => state.selectById(String(id))))
}

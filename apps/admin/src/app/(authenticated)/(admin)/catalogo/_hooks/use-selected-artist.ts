import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useArtistUIStore } from '../_store/artist-ui-store'
import type { CatalogArtist } from '../_types'

/**
 * Hook to get the currently selected artist for dialogs.
 * Combines selectedArtistId from view store with artist lookup from UI store.
 * Returns undefined if no artist is selected.
 */
export function useSelectedArtist(): CatalogArtist | undefined {
  const selectedArtistId = useCatalogViewStore(
    (state) => state.selectedArtistId
  )
  return useArtistUIStore.getState().selectById(selectedArtistId || -1)
}

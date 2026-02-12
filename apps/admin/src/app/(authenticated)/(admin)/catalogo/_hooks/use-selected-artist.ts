'use client'

import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useArtistById } from './use-artist-ui'
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
  return useArtistById(selectedArtistId || -1)
}

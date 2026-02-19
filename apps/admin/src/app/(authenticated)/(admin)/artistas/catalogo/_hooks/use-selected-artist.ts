import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useArtistaUIStore } from '../_store/artista-ui-store'
import { useCatalogoArtistaUIStore } from '../_store/catalogo-artista-ui-store'
import { mergeToCatalogArtist } from './use-artist-ui'
import type { CatalogArtist } from '../_types'

/**
 * Hook to get the currently selected artist for dialogs.
 * Combines selectedArtistId from view store with artist lookup from both UI stores.
 * Merges Artista + CatalogoArtista into CatalogArtist for display.
 * Returns undefined if no artist is selected.
 */
export function useSelectedArtist(): CatalogArtist | undefined {
  const selectedArtistId = useCatalogViewStore(
    (state) => state.selectedArtistId
  )
  if (!selectedArtistId) return undefined

  const artistaState = useArtistaUIStore.getState()
  const catalogoState = useCatalogoArtistaUIStore.getState()

  const catalogoItems = catalogoState.selectAll()
  const catalogoItem = catalogoItems.find(
    (c) => c.artistaId === selectedArtistId
  )
  if (!catalogoItem) return undefined

  const artistaEntities = artistaState.getEffectiveData().entities
  return mergeToCatalogArtist(catalogoItem, artistaEntities) ?? undefined
}

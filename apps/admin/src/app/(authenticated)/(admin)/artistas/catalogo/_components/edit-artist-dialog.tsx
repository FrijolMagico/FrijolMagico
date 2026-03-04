'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'
import { useCatalogProjectionStore } from '../_store/catalog-ui-store'
import { EditFormContent } from '../../_components/edit-artist-dialog'

export function EditArtistDialog() {
  const closeArtistDialog = useCatalogViewStore((s) => s.closeArtistDialog)
  const artistDialogOpen = useCatalogViewStore((s) => s.artistDialogOpen)
  const catalogId = useCatalogViewStore((s) => s.selectedCatalogId)
  const catalog = useCatalogProjectionStore((s) =>
    catalogId ? s.byId[catalogId] : null
  )
  const artist = useArtistsProjectionStore((s) =>
    catalog ? s.byId[catalog.artistaId] : null
  )

  return (
    <Dialog
      open={artistDialogOpen}
      onOpenChange={(open) => !open && closeArtistDialog()}
    >
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Editar Artista</DialogTitle>
        </DialogHeader>
        {artist && catalogId && (
          <EditFormContent
            key={artist.id}
            artist={artist}
            onClose={closeArtistDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

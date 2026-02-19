'use client'

import { Pencil, MapPin, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { ArtistAvatar } from './artist-avatar'
import type { CatalogArtist } from '../_types'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useArtistaUIStore } from '../_store/artista-ui-store'

interface EditCatalogDialogProps {
  artist: CatalogArtist | undefined
}

export function EditCatalogDialog({ artist }: EditCatalogDialogProps) {
  const updateOne = useArtistaUIStore((s) => s.updateOne)

  const closeAllDialogs = useCatalogViewStore((s) => s.closeAllDialogs)
  const openArtistDialog = useCatalogViewStore((s) => s.openArtistDialog)
  const catalogDialogOpen = useCatalogViewStore((s) => s.catalogDialogOpen)

  const handleEditCatalogDetail = (
    field: 'destacado' | 'activo' | 'descripcion',
    value: boolean | string
  ) => {
    if (!artist) return
    updateOne(artist.artistaId, { [field]: value })
  }

  if (!artist) return null

  return (
    <Dialog open={catalogDialogOpen} onOpenChange={closeAllDialogs}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Editar Catálogo</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Artist Info Card */}
          <Card className='bg-muted/30'>
            <CardContent>
              <div className='flex items-center gap-4'>
                <ArtistAvatar
                  src={artist.avatarUrl}
                  alt={artist.pseudonimo}
                  size='lg'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-lg font-semibold'>
                      {artist.pseudonimo}
                    </h3>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8'
                      onClick={openArtistDialog}
                      title='Editar información del artista'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                  </div>
                  {artist.nombre && (
                    <p className='text-muted-foreground font-semibold'>
                      {artist.nombre}
                    </p>
                  )}
                  <div className='text-muted-foreground mt-2 flex flex-col gap-1 text-xs'>
                    {(artist.ciudad || artist.pais) && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {[artist.ciudad, artist.pais]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                    {artist.correo && (
                      <span className='flex items-center gap-1'>
                        <Mail className='h-3 w-3' />
                        {artist.correo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='descripcion'>Descripción</Label>
              <Textarea
                id='descripcion'
                value={artist.descripcion ?? ''}
                onChange={(e) =>
                  handleEditCatalogDetail('descripcion', e.target.value)
                }
                placeholder='Descripción del artista para el catálogo...'
                className='min-h-50'
              />
            </div>

            {/* Catalog Fields */}
            <div className='flex items-center justify-center gap-6'>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={artist.destacado}
                  onCheckedChange={(checked) =>
                    handleEditCatalogDetail('destacado', checked)
                  }
                />
                <Label>Destacado</Label>
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={artist.activo}
                  onCheckedChange={(checked) =>
                    handleEditCatalogDetail('activo', checked)
                  }
                />
                <Label>Activo</Label>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

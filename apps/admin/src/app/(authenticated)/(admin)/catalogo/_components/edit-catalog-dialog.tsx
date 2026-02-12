'use client'

import { useState, useCallback } from 'react'
import { Pencil, MapPin, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
// import { updateCatalogEntry } from '../_actions/catalog.actions'
import { ArtistAvatar } from './artist-avatar'
// import { toast } from 'sonner'
import { useCatalogView } from '../_hooks/use-catalog-view'
import type { CatalogArtist } from '../_types'

interface EditCatalogDialogProps {
  open: boolean
  artist: CatalogArtist | undefined
}

export function EditCatalogDialog({ open, artist }: EditCatalogDialogProps) {
  const { closeAllDialogs, openArtistDialog } = useCatalogView()

  const [formData, setFormData] = useState({
    descripcion: artist?.descripcion || '',
    activo: artist?.activo ?? true,
    destacado: artist?.destacado ?? false
  })

  const updateField = useCallback(
    (field: keyof typeof formData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }))
    },
    []
  )

  // TODO: This is for the send to L2 (Journal/Draft)
  // const handleSave = useCallback(async () => {
  //   if (!artist) return
  //
  //   try {
  //     await updateCatalogEntry(artist.artistaId, {
  //       descripcion: formData.descripcion,
  //       activo: formData.activo,
  //       destacado: formData.destacado
  //     })
  //
  //     // Update local state
  //     updateOne(String(artist.artistaId), {
  //       descripcion: formData.descripcion,
  //       activo: formData.activo,
  //       destacado: formData.destacado
  //     })
  //
  //     toast.success('Catálogo actualizado')
  //     closeAllDialogs()
  //   } catch (error) {
  //     toast.error('Error al actualizar')
  //     console.error(error)
  //   } finally {
  //   }
  // }, [artist, formData, updateOne, closeAllDialogs])

  if (!artist) return null

  return (
    <Dialog open={open} onOpenChange={closeAllDialogs}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Editar Catálogo</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Artist Info Card */}
          <Card className='bg-muted/30'>
            <CardContent className='pt-6'>
              <div className='flex gap-4'>
                <ArtistAvatar
                  src={artist.avatarUrl}
                  alt={artist.pseudonimo}
                  size='lg'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold'>
                      {artist.nombre || artist.pseudonimo}
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
                    <p className='text-muted-foreground text-sm'>
                      @{artist.pseudonimo}
                    </p>
                  )}
                  <div className='text-muted-foreground mt-2 flex items-center gap-4 text-sm'>
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
                  <p className='text-muted-foreground/70 mt-2 text-xs'>
                    Orden:{' '}
                    <span className='font-mono'>{artist.orden}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catalog Fields */}
          <div className='space-y-6'>
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={formData.destacado}
                  onCheckedChange={(checked) =>
                    updateField('destacado', checked)
                  }
                />
                <Label>Destacado</Label>
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={formData.activo}
                  onCheckedChange={(checked) => updateField('activo', checked)}
                />
                <Label>Activo</Label>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='descripcion'>Descripción</Label>
              <Textarea
                id='descripcion'
                value={formData.descripcion}
                onChange={(e) => updateField('descripcion', e.target.value)}
                placeholder='Descripción del artista para el catálogo...'
                className='min-h-50'
              />
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={closeAllDialogs}>
              Cancelar
            </Button>
            {/* TODO: Acá va a ir el botón que NO guarda en persistence si no que envía la modificación a L2 (Journal/Draft), luego para envíar a L3 usamos el save btn global. */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

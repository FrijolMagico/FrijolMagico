'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { updateCatalogEntry } from '../_actions/catalog.actions'
import { ArtistAvatar } from './artist-avatar'
import { toast } from 'sonner'
import { GlobalSaveButton } from '@/shared/global-save'
import { useCatalogView } from '../_hooks/use-catalog-view'
import { useArtistaUI, useArtistaById } from '../_hooks/use-artist-ui'

interface EditCatalogDialogProps {
  open: boolean
}

export function EditCatalogDialog({ open }: EditCatalogDialogProps) {
  const { selectedArtistaId, closeAllDialogs, openArtistaDialog } =
    useCatalogView()
  const { updateOne } = useArtistaUI()
  const selectedArtista = selectedArtistaId
    ? useArtistaById(selectedArtistaId)
    : null

  const [formData, setFormData] = useState({
    descripcion: '',
    activo: true,
    destacado: false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load current data
  useEffect(() => {
    if (selectedArtista) {
      setFormData({
        descripcion: selectedArtista.descripcion || '',
        activo: selectedArtista.activo,
        destacado: selectedArtista.destacado
      })
      setHasChanges(false)
    }
  }, [selectedArtista, open])

  const updateField = useCallback(
    (field: keyof typeof formData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }))
      setHasChanges(true)
    },
    []
  )

  const handleSave = useCallback(async () => {
    if (!selectedArtista) return

    try {
      setIsSaving(true)
      await updateCatalogEntry(selectedArtista.artistaId, {
        descripcion: formData.descripcion,
        activo: formData.activo,
        destacado: formData.destacado
      })

      // Update local state
      updateOne(String(selectedArtista.artistaId), {
        descripcion: formData.descripcion,
        activo: formData.activo,
        destacado: formData.destacado
      })

      toast.success('Catálogo actualizado')
      setHasChanges(false)
      closeAllDialogs()
    } catch (error) {
      toast.error('Error al actualizar')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [selectedArtista, formData, updateOne, closeAllDialogs])

  if (!selectedArtista) return null

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
                  src={selectedArtista.avatarUrl}
                  alt={selectedArtista.pseudonimo}
                  size='lg'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold'>
                      {selectedArtista.nombre || selectedArtista.pseudonimo}
                    </h3>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8'
                      onClick={openArtistaDialog}
                      title='Editar información del artista'
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                  </div>
                  {selectedArtista.nombre && (
                    <p className='text-muted-foreground text-sm'>
                      @{selectedArtista.pseudonimo}
                    </p>
                  )}
                  <div className='text-muted-foreground mt-2 flex items-center gap-4 text-sm'>
                    {(selectedArtista.ciudad || selectedArtista.pais) && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {[selectedArtista.ciudad, selectedArtista.pais]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                    {selectedArtista.correo && (
                      <span className='flex items-center gap-1'>
                        <Mail className='h-3 w-3' />
                        {selectedArtista.correo}
                      </span>
                    )}
                  </div>
                  <p className='text-muted-foreground/70 mt-2 text-xs'>
                    Orden:{' '}
                    <span className='font-mono'>{selectedArtista.orden}</span>
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
                className='min-h-[200px]'
              />
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={closeAllDialogs}>
              Cancelar
            </Button>
            <GlobalSaveButton
              hasChanges={hasChanges}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

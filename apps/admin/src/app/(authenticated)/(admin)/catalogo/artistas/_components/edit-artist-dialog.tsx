'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { updateArtista } from '../_actions/catalog.actions'
import { toast } from 'sonner'
import { GlobalSaveButton } from '@/shared/global-save'
import { useCatalogView } from '../_hooks/use-catalog-view'
import { useArtistaUI, useArtistaById } from '../_hooks/use-artist-ui'

interface EditArtistDialogProps {
  open: boolean
}

export function EditArtistDialog({ open }: EditArtistDialogProps) {
  const { selectedArtistaId, closeArtistaDialog } = useCatalogView()
  const { updateOne } = useArtistaUI()

  // Safe selector
  const selectedArtista = useArtistaById(selectedArtistaId || 0)

  // Local form state
  const [formData, setFormData] = useState({
    nombre: '',
    pseudonimo: '',
    correo: '',
    rrss: '',
    ciudad: '',
    pais: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Initialize form
  useEffect(() => {
    if (selectedArtista && open) {
      setFormData({
        nombre: selectedArtista.nombre || '',
        pseudonimo: selectedArtista.pseudonimo,
        correo: selectedArtista.correo || '',
        rrss: selectedArtista.rrss || '',
        ciudad: selectedArtista.ciudad || '',
        pais: selectedArtista.pais || ''
      })
      setIsDirty(false)
    }
  }, [selectedArtista, open])

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = useCallback(async () => {
    if (!selectedArtista) return

    setIsSaving(true)

    try {
      const result = await updateArtista(selectedArtista.artistaId, formData)

      if (result.success) {
        // Update the list via ui-state
        updateOne(String(selectedArtista.artistaId), {
          nombre: formData.nombre,
          pseudonimo: formData.pseudonimo,
          correo: formData.correo,
          rrss: formData.rrss,
          ciudad: formData.ciudad,
          pais: formData.pais
        })

        toast.success('Información del artista guardada correctamente')
        closeArtistaDialog()
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }, [selectedArtista, formData, updateOne, closeArtistaDialog])

  if (!selectedArtista) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && closeArtistaDialog()}>
      <DialogContent className='z-60 max-w-xl'>
        <DialogHeader>
          <DialogTitle>Editar Información del Artista</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='nombre'>Nombre</Label>
              <Input
                id='nombre'
                value={formData.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                placeholder='Nombre completo'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='pseudonimo'>
                Pseudónimo <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='pseudonimo'
                value={formData.pseudonimo}
                onChange={(e) => updateField('pseudonimo', e.target.value)}
                placeholder='@usuario'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='correo'>Correo electrónico</Label>
            <Input
              id='correo'
              type='email'
              value={formData.correo}
              onChange={(e) => updateField('correo', e.target.value)}
              placeholder='artista@ejemplo.com'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='rrss'>Redes Sociales</Label>
            <Textarea
              id='rrss'
              value={formData.rrss}
              onChange={(e) => updateField('rrss', e.target.value)}
              placeholder='@instagram, @twitter, etc.'
              rows={2}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='ciudad'>Ciudad</Label>
              <Input
                id='ciudad'
                value={formData.ciudad}
                onChange={(e) => updateField('ciudad', e.target.value)}
                placeholder='Santiago'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='pais'>País</Label>
              <Input
                id='pais'
                value={formData.pais}
                onChange={(e) => updateField('pais', e.target.value)}
                placeholder='Chile'
              />
            </div>
          </div>

          <p className='text-muted-foreground text-xs'>
            <span className='text-destructive'>*</span> Campo único en el
            sistema
          </p>
        </div>

        {/* Actions */}
        <Separator />
        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={closeArtistaDialog}>
            Cancelar
          </Button>
          <GlobalSaveButton
            hasChanges={isDirty}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

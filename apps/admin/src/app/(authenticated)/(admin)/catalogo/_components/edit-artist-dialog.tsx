'use client'

import { useState, useCallback } from 'react'
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
import { toast } from 'sonner'
import { useCatalogView } from '../_hooks/use-catalog-view'
import { useArtistUI } from '../_hooks/use-artist-ui'
import { updateArtist } from '../_actions/catalog.actions'
import type { CatalogArtist } from '../_types'

interface EditArtistDialogProps {
  artist: CatalogArtist | undefined
}

export function EditArtistDialog({ artist }: EditArtistDialogProps) {
  const { closeArtistDialog, artistDialogOpen } = useCatalogView()
  const { updateOne } = useArtistUI()

  // Local form state
  const [formData, setFormData] = useState({
    nombre: artist?.nombre ?? '',
    pseudonimo: artist?.pseudonimo ?? '',
    correo: artist?.correo ?? '',
    rrss: artist?.rrss ?? {},
    ciudad: artist?.ciudad ?? '',
    pais: artist?.pais ?? ''
  })

  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = useCallback(async () => {
    // TODO: We need a phase in this algorithm to validate the form data before sending it to the server, for example, we can check if the pseudonimo is not empty and if the email is valid, etc. For now, we will skip this validation for simplicity.
    if (!artist) return

    setIsSaving(true)

    try {
      const result = await updateArtist(artist.artistaId, formData)

      if (result.success) {
        // Update the list via ui-state
        updateOne(String(artist.artistaId), {
          nombre: formData.nombre,
          pseudonimo: formData.pseudonimo,
          correo: formData.correo,
          rrss: formData.rrss,
          ciudad: formData.ciudad,
          pais: formData.pais
        })

        toast.success('Información del artista guardada correctamente')
        closeArtistDialog()
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }, [artist, formData, updateOne, closeArtistDialog])

  if (!artist) return null

  return (
    <Dialog
      open={artistDialogOpen}
      onOpenChange={(open) => !open && closeArtistDialog()}
    >
      <DialogContent className='z-60 mt-6 ml-6 max-w-xl'>
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

          {/* TODO: we return an object with the key is the rrss web and the value the url, for example: { instagram: 'https://instagram.com/usuario', twitter: 'https://twitter.com/usuario' }, but for simplicity we will use a textarea where the admin can write the rrss separated by commas, for example: @instagram, @twitter, etc. We can improve this in the future if we want to have a better structure for the rrss data. */}
          <div className='space-y-2'>
            <Label htmlFor='rrss'>Redes Sociales</Label>
            {/* TODO: add a list where we can add or delete rrss, we will have two inputs in a row, when a rrss is saved or came from db, the first input will be the rrss name and will be just a paragraph. */}
            {/*   When the admin click on edit, just edit the url for the rrss, the admin can delete the entry */}
            {/*   When admin add a new entry, the two inputs appear, the admin can add the rrss name and te url, when the admin save, we stringify the data and send it to the server. */}
            {/* NOTE: Empty for now */}
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
          <Button variant='outline' onClick={closeArtistDialog}>
            Cancelar
          </Button>
          {/* NOTE: This button update a artist information in the remote and is not conencted witht he L3 global saving. */}
          <Button onClick={handleSave} disabled={isSaving}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

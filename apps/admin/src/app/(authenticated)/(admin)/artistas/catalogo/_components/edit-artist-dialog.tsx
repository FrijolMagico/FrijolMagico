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
import { updateArtist } from '../_actions/catalog.actions'
import { ArtistRRSSManager } from './artist-rrss-manager'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import {
  useArtistsOperationStore,
  useArtistsProjectionStore
} from '../../_store/artista-ui-store'
import { useCatalogProjectionStore } from '../_store/catalog-ui-store'
import { ArtistEntry } from '../../_types'

function ArtistFormContent({
  artist,
  catalogId,
  onClose
}: {
  artist: ArtistEntry
  catalogId: string
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    nombre: artist.nombre ?? '',
    pseudonimo: artist.pseudonimo ?? '',
    correo: artist.correo ?? '',
    rrss: artist.rrss ?? {},
    ciudad: artist.ciudad ?? '',
    pais: artist.pais ?? ''
  })

  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateRRSS = (value: { [key: string]: string }) => {
    setFormData((prev) => ({ ...prev, rrss: value }))
  }

  const handleSave = useCallback(async () => {
    setIsSaving(true)

    try {
      const result = await updateArtist(Number(artist.id), formData)

      if (result.success) {
        useArtistsOperationStore.getState().update(artist.id, formData)

        toast.success('Información del artista guardada correctamente')
        onClose()
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }, [artist, formData, onClose])

  return (
    <>
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
          <span className='text-destructive'>*</span> Campo único en el sistema
        </p>

        <ArtistRRSSManager initialValue={artist.rrss} onChange={updateRRSS} />
      </div>

      <Separator />
      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          Guardar cambios
        </Button>
      </div>
    </>
  )
}

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
      <DialogContent className='z-60 mt-6 ml-6 max-w-xl'>
        <DialogHeader>
          <DialogTitle>Editar Información del Artista</DialogTitle>
        </DialogHeader>
        {artist && catalogId && (
          <ArtistFormContent
            key={artist.id}
            artist={artist}
            catalogId={catalogId}
            onClose={closeArtistDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

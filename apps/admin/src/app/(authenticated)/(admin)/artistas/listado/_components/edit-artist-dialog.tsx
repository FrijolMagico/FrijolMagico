'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import {
  useArtistsOperationStore,
  useArtistsProjectionStore
} from '../../_store/artista-ui-store'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { ArtistRRSSManager } from '../../catalogo/_components/artist-rrss-manager'
import { ArtistEntry } from '../../_types'

function EditFormContent({
  artist,
  onClose
}: {
  artist: ArtistEntry
  onClose: () => void
}) {
  const update = useArtistsOperationStore((s) => s.update)

  const [formData, setFormData] = useState({
    nombre: artist.nombre ?? '',
    pseudonimo: artist.pseudonimo ?? '',
    correo: artist.correo ?? '',
    rrss: artist.rrss ?? {},
    city: artist.ciudad ?? '',
    country: artist.pais ?? '',
    statusId: artist.estadoId
  })

  const updateField = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateRRSS = (value: { [key: string]: string }) => {
    setFormData((prev) => ({ ...prev, rrss: value }))
  }

  const handleSave = () => {
    const estadoIdToSlug: Record<number, string> = {
      1: 'desconocido',
      2: 'activo',
      3: 'inactivo',
      4: 'vetado',
      5: 'cancelado'
    }

    update(artist.id, {
      nombre: formData.nombre,
      pseudonimo: formData.pseudonimo,
      correo: formData.correo,
      rrss: formData.rrss,
      ciudad: formData.city,
      pais: formData.country,
      estadoId: formData.statusId,
      estadoSlug: estadoIdToSlug[formData.statusId] || 'desconocido'
    })

    onClose()
  }

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

        <div className='grid grid-cols-2 gap-4'>
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
            <Label htmlFor='estadoId'>Estado</Label>
            <Select
              value={String(formData.statusId)}
              onValueChange={(v) => updateField('statusId', Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Estado'>
                  {formData.statusId === 2
                    ? 'Activo'
                    : formData.statusId === 3
                      ? 'Inactivo'
                      : formData.statusId === 4
                        ? 'Vetado'
                        : formData.statusId === 5
                          ? 'Cancelado'
                          : 'Desconocido'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='2'>Activo</SelectItem>
                <SelectItem value='3'>Inactivo</SelectItem>
                <SelectItem value='4'>Vetado</SelectItem>
                <SelectItem value='5'>Cancelado</SelectItem>
                <SelectItem value='1'>Desconocido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='ciudad'>Ciudad</Label>
            <Input
              id='ciudad'
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder='Santiago'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='pais'>País</Label>
            <Input
              id='pais'
              value={formData.country}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder='Chile'
            />
          </div>
        </div>

        <ArtistRRSSManager initialValue={artist.rrss} onChange={updateRRSS} />
      </div>

      <Separator />
      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Confirmar Edición</Button>
      </div>
    </>
  )
}

export function EditArtistDialog() {
  const isOpen = useArtistDialog((s) => s.editDialogOpen)
  const closeEditDialog = useArtistDialog((s) => s.closeEditDialog)
  const artistId = useArtistDialog((s) => s.selectedArtistId)

  const artist = useArtistsProjectionStore((s) =>
    artistId ? s.byId[artistId] : null
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeEditDialog()}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Editar Artista</DialogTitle>
        </DialogHeader>
        {artist && (
          <EditFormContent
            key={artist.id}
            artist={artist}
            onClose={closeEditDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

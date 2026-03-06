'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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
} from '../_store/artista-ui-store'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { ArtistRRSSManager } from '../catalogo/_components/artist-rrss-manager'
import type { ArtistEntry } from '../_types'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'

export function EditFormContent({
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

  const [historialChecks, setHistorialChecks] = useState({
    pseudonimo: false,
    correo: false,
    rrss: false,
    ciudad: false,
    pais: false
  })

  const hasChanged = {
    pseudonimo:
      formData.pseudonimo !== (artist.pseudonimo ?? '') &&
      Boolean(artist.pseudonimo),
    correo: formData.correo !== (artist.correo ?? '') && Boolean(artist.correo),
    rrss:
      JSON.stringify(formData.rrss) !== JSON.stringify(artist.rrss ?? {}) &&
      Object.keys(artist.rrss ?? {}).length > 0,
    ciudad: formData.city !== (artist.ciudad ?? '') && Boolean(artist.ciudad),
    pais: formData.country !== (artist.pais ?? '') && Boolean(artist.pais)
  }

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

    const _historialData: ArtistEntry['_historialData'] = {}

    if (
      historialChecks.pseudonimo &&
      hasChanged.pseudonimo &&
      artist.pseudonimo
    ) {
      _historialData.pseudonimo = artist.pseudonimo
    }
    if (historialChecks.correo && hasChanged.correo && artist.correo) {
      _historialData.correo = artist.correo
    }
    if (historialChecks.rrss && hasChanged.rrss && artist.rrss) {
      _historialData.rrss = artist.rrss
    }
    if (historialChecks.ciudad && hasChanged.ciudad && artist.ciudad) {
      _historialData.ciudad = artist.ciudad
    }
    if (historialChecks.pais && hasChanged.pais && artist.pais) {
      _historialData.pais = artist.pais
    }

    update(artist.id, {
      nombre: formData.nombre,
      pseudonimo: formData.pseudonimo,
      correo: formData.correo,
      rrss: formData.rrss,
      ciudad: formData.city,
      pais: formData.country,
      estadoId: formData.statusId,
      estadoSlug: estadoIdToSlug[formData.statusId] || 'desconocido',
      ...(Object.keys(_historialData).length > 0 && { _historialData })
    })

    onClose()
  }

  return (
    <>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor='nombre'>Nombre</FieldLabel>
          <Input
            id='nombre'
            value={formData.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            placeholder='Nombre completo'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='pseudonimo'>
            Pseudónimo <span className='text-destructive'>*</span>
          </FieldLabel>
          <Input
            id='pseudonimo'
            value={formData.pseudonimo}
            onChange={(e) => updateField('pseudonimo', e.target.value)}
            placeholder='@usuario'
            required
          />
          {hasChanged.pseudonimo && (
            <div className='mt-1 flex items-center gap-2'>
              <Switch
                id='historial-pseudonimo'
                checked={historialChecks.pseudonimo}
                onCheckedChange={(checked) =>
                  setHistorialChecks((prev) => ({
                    ...prev,
                    pseudonimo: checked
                  }))
                }
              />
              <Label
                htmlFor='historial-pseudonimo'
                className='text-muted-foreground cursor-pointer text-xs font-normal'
              >
                Guardar valor anterior en historial
              </Label>
            </div>
          )}
        </Field>

        <div className='grid grid-cols-2 gap-4'>
          <Field>
            <FieldLabel htmlFor='correo'>Correo electrónico</FieldLabel>
            <Input
              id='correo'
              type='email'
              value={formData.correo}
              onChange={(e) => updateField('correo', e.target.value)}
              placeholder='artista@ejemplo.com'
            />
            {hasChanged.correo && (
              <div className='mt-1 flex items-center gap-2'>
                <Switch
                  id='historial-correo'
                  checked={historialChecks.correo}
                  onCheckedChange={(checked) =>
                    setHistorialChecks((prev) => ({ ...prev, correo: checked }))
                  }
                />
                <Label
                  htmlFor='historial-correo'
                  className='text-muted-foreground cursor-pointer text-xs font-normal'
                >
                  Guardar valor anterior en historial
                </Label>
              </div>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor='estadoId'>Estado</FieldLabel>
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
          </Field>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Field>
            <FieldLabel htmlFor='ciudad'>Ciudad</FieldLabel>
            <Input
              id='ciudad'
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder='Santiago'
            />
            {hasChanged.ciudad && (
              <div className='mt-1 flex items-center gap-2'>
                <Switch
                  id='historial-ciudad'
                  checked={historialChecks.ciudad}
                  onCheckedChange={(checked) =>
                    setHistorialChecks((prev) => ({ ...prev, ciudad: checked }))
                  }
                />
                <Label
                  htmlFor='historial-ciudad'
                  className='text-muted-foreground cursor-pointer text-xs font-normal'
                >
                  Guardar valor anterior en historial
                </Label>
              </div>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor='pais'>País</FieldLabel>
            <Input
              id='pais'
              value={formData.country}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder='Chile'
            />
            {hasChanged.pais && (
              <div className='mt-1 flex items-center gap-2'>
                <Switch
                  id='historial-pais'
                  checked={historialChecks.pais}
                  onCheckedChange={(checked) =>
                    setHistorialChecks((prev) => ({ ...prev, pais: checked }))
                  }
                />
                <Label
                  htmlFor='historial-pais'
                  className='text-muted-foreground cursor-pointer text-xs font-normal'
                >
                  Guardar valor anterior en historial
                </Label>
              </div>
            )}
          </Field>
        </div>

        <ArtistRRSSManager initialValue={artist.rrss} onChange={updateRRSS} />
        {hasChanged.rrss && (
          <div className='mt-1 flex items-center gap-2'>
            <Switch
              id='historial-rrss'
              checked={historialChecks.rrss}
              onCheckedChange={(checked) =>
                setHistorialChecks((prev) => ({ ...prev, rrss: checked }))
              }
            />
            <Label
              htmlFor='historial-rrss'
              className='text-muted-foreground cursor-pointer text-xs font-normal'
            >
              Guardar valor anterior en historial
            </Label>
          </div>
        )}
      </FieldGroup>

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

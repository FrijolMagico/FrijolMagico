'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Pencil, MapPin, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { ArtistAvatar } from './artist-avatar'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'
import { Field, FieldLabel } from '@/shared/components/ui/field'

export function EditCatalogDialog() {
  const catalogId = useCatalogViewStore((s) => s.selectedCatalogId)
  const catalog = useCatalogProjectionStore((s) =>
    catalogId ? s.byId[catalogId] : null
  )
  const artist = useArtistsProjectionStore((s) =>
    catalog ? s.byId[catalog.artistaId] : null
  )

  const [desc, setDesc] = useState(catalog?.descripcion ?? '')
  const [prevCatalogDesc, setPrevCatalogDesc] = useState(
    catalog?.descripcion ?? ''
  )
  const [isEditing, setIsEditing] = useState(false)

  const incomingDesc = catalog?.descripcion ?? ''
  if (incomingDesc !== prevCatalogDesc) {
    if (!isEditing) {
      setDesc(incomingDesc)
    }
    setPrevCatalogDesc(incomingDesc)
  }

  const update = useCatalogOperationStore((s) => s.update)

  const debouncedUpdate = useDebouncedCallback((val: string) => {
    if (!catalogId) return
    update(catalogId, { descripcion: val })
    setIsEditing(false)
  }, 500)

  const closeAllDialogs = useCatalogViewStore((s) => s.closeAllDialogs)
  const openArtistDialog = useCatalogViewStore((s) => s.openArtistDialog)
  const catalogDialogOpen = useCatalogViewStore((s) => s.catalogDialogOpen)

  const handleEditCatalogDetail = (
    field: 'destacado' | 'activo' | 'descripcion',
    value: boolean | string
  ) => {
    if (!catalogId) return
    update(catalogId, { [field]: value })
  }

  if (!catalog || !artist) return null

  return (
    <Dialog open={catalogDialogOpen} onOpenChange={closeAllDialogs}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Editar Catálogo</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Artist Info Card */}
          <div className='flex items-center gap-6'>
            <ArtistAvatar
              src={catalog.avatarUrl}
              alt={artist.pseudonimo}
              size='2xl'
            />
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-semibold'>{artist.pseudonimo}</h3>
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
                    {[artist.ciudad, artist.pais].filter(Boolean).join(', ')}
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

          <div className='space-y-6'>
            <Field className='space-y-2'>
              <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
              <Textarea
                id='descripcion'
                value={desc}
                onChange={(e) => {
                  setIsEditing(true)
                  setDesc(e.target.value)
                  debouncedUpdate(e.target.value)
                }}
                placeholder='Descripción del artista para el catálogo...'
                className='min-h-50'
              />
            </Field>

            {/* Catalog Fields */}
            <div className='flex items-center justify-center gap-6'>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={catalog.destacado}
                  onCheckedChange={(checked) =>
                    handleEditCatalogDetail('destacado', checked)
                  }
                />
                <Label>Destacado</Label>
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={catalog.activo}
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

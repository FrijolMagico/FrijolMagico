'use client'

import { useState } from 'react'
import { generateKeyBetween } from 'fractional-indexing'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { Button } from '@/shared/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/shared/components/ui/combobox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'

import { useCatalogViewStore } from '../_store/catalog-view-store'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'

type ArtistItem = { value: string; label: string }

interface AddCatalogFormContentProps {
  onApply: (data: {
    artistaId: string
    orden: string
    destacado: boolean
    activo: boolean
    descripcion: string | null
  }) => void
  onCancel: () => void
}

function AddCatalogFormContent({
  onApply,
  onCancel
}: AddCatalogFormContentProps) {
  const [selectedArtist, setSelectedArtist] = useState<ArtistItem | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [destacado, setDestacado] = useState(false)
  const [activo, setActivo] = useState(true)
  const [errors, setErrors] = useState<{ artistaId?: string }>({})

  const catalogById = useCatalogProjectionStore((s) => s.byId)
  const catalogArtistIds = new Set(
    Object.values(catalogById)
      .filter((e) => !e.__meta?.isDeleted)
      .map((e) => e.artistaId)
  )

  const artistAllIds = useArtistsProjectionStore((s) => s.allIds)
  const artistById = useArtistsProjectionStore((s) => s.byId)

  const availableItems: ArtistItem[] = artistAllIds
    .filter((id) => !artistById[id]?.__meta?.isDeleted)
    .filter((id) => !artistById[id]?.__meta?.isNew)
    .filter((id) => !catalogArtistIds.has(id))
    .map((id) => ({
      value: id,
      label: artistById[id]?.pseudonimo ?? id
    }))
    .filter((item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    )

  const handleApply = () => {
    if (!selectedArtist) {
      setErrors({ artistaId: 'Debes seleccionar un artista' })
      return
    }

    const allCatalogIds = useCatalogProjectionStore.getState().allIds
    const catalogByIdSnap = useCatalogProjectionStore.getState().byId
    const lastOrden =
      allCatalogIds
        .filter((id) => !catalogByIdSnap[id]?.__meta?.isDeleted)
        .map((id) => catalogByIdSnap[id]?.orden)
        .filter((o): o is string => !!o)
        .sort()
        .at(-1) ?? null

    const newOrden = generateKeyBetween(lastOrden, null)

    onApply({
      artistaId: selectedArtist.value,
      orden: newOrden,
      destacado,
      activo,
      descripcion: descripcion.trim() || null
    })
  }

  return (
    <FieldGroup className='pt-4'>
      <Field>
        <FieldLabel>
          Artista <span className='text-destructive'>*</span>
        </FieldLabel>
        <Combobox
          items={availableItems}
          value={selectedArtist}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          onValueChange={(item) => {
            setSelectedArtist(item)
            setErrors((prev) => ({ ...prev, artistaId: undefined }))
          }}
          isItemEqualToValue={(item, val) => item.value === val.value}
        >
          <ComboboxInput placeholder='Buscar artista...' showTrigger />
          <ComboboxContent>
            <ComboboxEmpty>
              No hay artistas disponibles para agregar
            </ComboboxEmpty>
            <ComboboxList>
              {availableItems.map((item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {errors.artistaId && <FieldError>{errors.artistaId}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
        <Textarea
          id='descripcion'
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder='Descripción del artista para el catálogo...'
          className='min-h-32'
        />
      </Field>

      <div className='flex items-center justify-center gap-6 py-4'>
        <div className='flex items-center gap-2'>
          <Switch checked={destacado} onCheckedChange={setDestacado} />
          <Label>Destacado</Label>
        </div>
        <div className='flex items-center gap-2'>
          <Switch checked={activo} onCheckedChange={setActivo} />
          <Label>Activo</Label>
        </div>
      </div>

      <div className='flex justify-end gap-2 pt-2'>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleApply}>Agregar al catálogo</Button>
      </div>
    </FieldGroup>
  )
}

export function AddCatalogDialog() {
  const addCatalogDialogOpen = useCatalogViewStore(
    (s) => s.addCatalogDialogOpen
  )
  const closeAddCatalogDialog = useCatalogViewStore(
    (s) => s.closeAddCatalogDialog
  )
  const add = useCatalogOperationStore((s) => s.add)

  const handleApply = (data: {
    artistaId: string
    orden: string
    destacado: boolean
    activo: boolean
    descripcion: string | null
  }) => {
    add({
      ...data,
      avatarUrl: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    closeAddCatalogDialog()
  }

  return (
    <EntityFormDialog
      open={addCatalogDialogOpen}
      onOpenChange={(open) => !open && closeAddCatalogDialog()}
      title='Agregar al Catálogo'
    >
      {addCatalogDialogOpen && (
        <AddCatalogFormContent
          onApply={handleApply}
          onCancel={closeAddCatalogDialog}
        />
      )}
    </EntityFormDialog>
  )
}

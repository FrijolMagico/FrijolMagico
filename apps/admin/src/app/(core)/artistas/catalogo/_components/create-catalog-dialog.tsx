'use client'

import { useForm, Controller } from 'react-hook-form'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
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
import { Textarea } from '@/shared/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { catalogInsertSchema } from '../_schemas/catalog.schema'
import { createCatalogAction } from '../_actions/create-catalog.action'
import type { CatalogCreateFormInput } from '../_schemas/catalog.schema'
import type { CatalogAvailableArtist } from '../_types/catalog-list-item'
import { toast } from 'sonner'
import { useCatalogDialog } from '../_store/catalog-dialog-store'
import { CREATE_CATALOG_FORM_ID } from '../_constants'
import { ControllerSwitch } from '@/shared/components/controller-switch'

interface CreateCatalogDialogProps {
  availableArtists: CatalogAvailableArtist[]
}

export function CreateCatalogDialog({
  availableArtists
}: CreateCatalogDialogProps) {
  const isCreateCatalogOpen = useCatalogDialog((s) => s.isCreateCatalogOpen)
  const toggleDialog = useCatalogDialog((s) => s.toggleCreateCatalogDialog)

  const {
    formState: { isValid, isDirty, errors, isSubmitting },
    register,
    reset,
    control,
    handleSubmit
  } = useForm({
    resolver: zodResolver(catalogInsertSchema.omit({ orden: true })),
    values: {
      artistaId: 0,
      descripcion: null,
      destacado: false,
      activo: true,
      avatarUrl: null
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: CatalogCreateFormInput) => {
    let success = false
    try {
      const result = await createCatalogAction({ success: false }, data)

      if (!result.success) {
        toast.error(
          result.errors?.[0]?.message ?? 'Error al agregar al catálogo'
        )
        return
      }

      success = true
      toggleDialog(false)
      toast.success('Artista agregado al catálogo')
    } finally {
      if (success) {
        reset()
      }
    }
  }

  const comboboxArtists = availableArtists.map((artist) => ({
    label: artist.pseudonimo,
    value: artist.id
  }))

  return (
    <EntityFormDialog
      open={isCreateCatalogOpen}
      onOpenChange={toggleDialog}
      title='Agregar al Catálogo'
      triggerLabel='Agregar al catálogo'
      isDirty={isDirty}
      submit={{
        form: CREATE_CATALOG_FORM_ID,
        isSubmitting,
        disabled: isSubmitting || !isDirty || !isValid
      }}
    >
      <form id={CREATE_CATALOG_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className='pt-4'>
          <Field>
            <FieldLabel>
              Artista <span className='text-destructive'>*</span>
            </FieldLabel>
            <Controller
              name='artistaId'
              control={control}
              render={({ field: { onChange, value } }) => {
                const selectedArtist = comboboxArtists.find(
                  (item) => item.value === value
                )

                return (
                  <Combobox
                    items={comboboxArtists}
                    value={selectedArtist ?? null}
                    onValueChange={(val) => {
                      onChange(val?.value ?? 0)
                    }}
                    itemToStringLabel={(item) => item?.label ?? ''}
                  >
                    <ComboboxInput
                      placeholder='Buscar artista...'
                      showTrigger
                      showClear
                    />
                    <ComboboxContent className='pointer-events-auto!'>
                      <ComboboxEmpty>No hay artistas disponibles</ComboboxEmpty>
                      <ComboboxList className=''>
                        {(artist: (typeof comboboxArtists)[0]) => (
                          <ComboboxItem key={artist.value} value={artist}>
                            {artist.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )
              }}
            />
            {errors.artistaId && (
              <FieldError>{errors.artistaId.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
            <Textarea
              id='descripcion'
              {...register('descripcion')}
              placeholder='Descripción del artista para el catálogo...'
              className='min-h-32'
            />
          </Field>

          <div className='flex items-center justify-center gap-6 py-4'>
            <ControllerSwitch
              name='destacado'
              control={control}
              label='Destacado'
            />
            <ControllerSwitch control={control} name='activo' label='Activo' />
          </div>
        </FieldGroup>
      </form>
    </EntityFormDialog>
  )
}

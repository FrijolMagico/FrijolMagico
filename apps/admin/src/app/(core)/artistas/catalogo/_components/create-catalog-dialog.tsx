'use client'

import { useRef } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

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
import { ControllerSwitch } from '@/shared/components/controller-switch'

import { catalogInsertSchema } from '../_schemas/catalog.schema'
import { createCatalogAction } from '../_actions/create-catalog.action'
import type { CatalogCreateFormInput } from '../_schemas/catalog.schema'
import type { CatalogAvailableArtist } from '../_types/catalog-list-item'
import { useCatalogDialog } from '../_store/catalog-dialog-store'
import { CREATE_CATALOG_FORM_ID } from '../_constants'
import { useAvatarController } from '../_hooks/use-avatar-controller'
import { ArtistAvatarSection } from './artist-avatar-section'
import type { ManagedAssetReference } from '@/shared/assets-manager/managed-asset-reference'

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

  const artistaId = useWatch({ name: 'artistaId', control })

  const selectedArtist = artistaId
    ? (availableArtists.find((a) => a.id === artistaId) ?? null)
    : null

  const controller = useAvatarController()
  const suppressCancelRef = useRef(false)

  // Avatar validation: satisfied if artist has existing avatar OR a file is ready
  const avatarSatisfied =
    !!selectedArtist?.avatarUrl || controller.state.phase === 'ready'

  const formValid = isDirty && isValid && avatarSatisfied

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // User closed the dialog (not programmatic after submit success)
      if (!suppressCancelRef.current) {
        controller.cancel()
      }
      toggleDialog(false)
    }
    toggleDialog(open)
  }

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

      // Post-submit enqueue
      const artistId = data.artistaId
      try {
        await controller.enqueue(artistId)
      } catch {
        // Enqueue failure handled by controller state — error+retry shown in ArtistAvatarSection
        // The catalog entry was already created
      }

      success = true
      suppressCancelRef.current = true
      toggleDialog(false)
      toast.success('Artista agregado al catálogo')
    } finally {
      if (success) {
        reset()
        suppressCancelRef.current = false
      }
    }
  }

  const comboboxArtists = availableArtists.map((artist) => ({
    label: artist.pseudonimo,
    value: artist.id,
    avatarUrl: artist.avatarUrl
  }))

  const currentAvatar: ManagedAssetReference | null = selectedArtist?.avatarUrl
    ? { path: selectedArtist.avatarUrl, version: null }
    : null

  return (
    <EntityFormDialog
      open={isCreateCatalogOpen}
      onOpenChange={handleOpenChange}
      title='Agregar al Catálogo'
      triggerLabel='Agregar al catálogo'
      isDirty={isDirty}
      submit={{
        type: 'submit',
        form: CREATE_CATALOG_FORM_ID,
        isSubmitting,
        disabled: isSubmitting || !formValid
      }}
    >
      <form id={CREATE_CATALOG_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className='pt-4'>
          <div className='flex items-center gap-6'>
            <ArtistAvatarSection
              artistId={artistaId}
              currentAvatar={controller.state.currentAvatar ?? currentAvatar}
              autoEnqueue={false}
              controller={{
                state: controller.state,
                selectFile: controller.selectFile,
                enqueue: controller.enqueue,
                cancel: controller.cancel,
                retry: controller.retry
              }}
            />
            <div className='flex-1'>
              <Field>
                <FieldLabel>
                  Artista <span className='text-destructive'>*</span>
                </FieldLabel>
                <Controller
                  name='artistaId'
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const selectedComboItem = comboboxArtists.find(
                      (item) => item.value === value
                    )

                    return (
                      <Combobox
                        items={comboboxArtists}
                        value={selectedComboItem ?? null}
                        onValueChange={(val) => {
                          onChange(val?.value ?? 0)
                          // Sync avatar when artist is selected
                          const artist = val?.value
                            ? (availableArtists.find(
                                (a) => a.id === val.value
                              ) ?? null)
                            : null

                          controller.syncAvatar(
                            artist?.avatarUrl
                              ? {
                                  path: artist.avatarUrl,
                                  version: null
                                }
                              : null
                          )
                        }}
                        itemToStringLabel={(item) => item?.label ?? ''}
                      >
                        <ComboboxInput
                          placeholder='Buscar artista...'
                          showTrigger
                          showClear
                        />
                        <ComboboxContent className='pointer-events-auto!'>
                          <ComboboxEmpty>
                            No hay artistas disponibles
                          </ComboboxEmpty>
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
            </div>
          </div>

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

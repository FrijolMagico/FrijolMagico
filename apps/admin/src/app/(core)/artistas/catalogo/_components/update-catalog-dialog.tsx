'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { IconPencil, IconMapPin, IconMail } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Field,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

import { ArtistAvatarSection } from './artist-avatar-section'
import { updateCatalogAction } from '../_actions/update-catalog.action'
import { useCatalogDialog } from '../_store/catalog-dialog-store'
import {
  catalogUpdateFormSchema,
  type Catalog,
  type CatalogUpdateFormInput
} from '../_schemas/catalog.schema'
import {
  AVATAR_CONFLICT,
  AVATAR_INTENT
} from '../_lib/avatar-history-contracts'
import { resolveAvatarIntent } from '../_lib/artist-avatar-history'
import { useAvatarController } from '../_hooks/use-avatar-controller'
import { useArtistAvatarHistory } from '../_hooks/use-artist-avatar-history'
import { useCatalogAvatarPending } from '../_lib/catalog-avatar-queue-state'
import { UpdateArtistDialog } from '../../_components/update-artist-dialog'
import { useArtistDialog } from '../../_store/artist-dialog-store'
import { UPDATE_CATALOG_FORM_ID } from '../_constants'
import type { Artist } from '../../_schemas/artista.schema'

interface UpdateCatalogDialogFormProps {
  catalog: Catalog
  artist: Artist
}

function UpdateCatalogDialogForm({
  catalog,
  artist
}: UpdateCatalogDialogFormProps) {
  const router = useRouter()
  const closeUpdateCatalogDialog = useCatalogDialog(
    (state) => state.closeUpdateCatalogDialog
  )
  const openUpdateArtistDialog = useArtistDialog(
    (state) => state.openUpdateArtistDialog
  )
  const hasAvatar = catalog.activeAvatar !== null
  const controller = useAvatarController({
    initialAvatar: catalog.activeAvatar ?? null
  })
  const history = useArtistAvatarHistory({
    artistId: artist.id,
    activeAvatar: catalog.activeAvatar ?? null
  })
  const hasPendingAvatar = useCatalogAvatarPending(artist.id)
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid, isSubmitting }
  } = useForm<CatalogUpdateFormInput>({
    resolver: zodResolver(catalogUpdateFormSchema),
    values: {
      descripcion: catalog.descripcion ?? '',
      activo: catalog.activo ?? true,
      destacado: catalog.destacado ?? false,
      expectedActive: catalog.activeAvatar ?? null,
      intent: AVATAR_INTENT.UNCHANGED
    }
  })

  const close = () => {
    controller.cancel()
    closeUpdateCatalogDialog()
  }

  const onSubmit = async (data: CatalogUpdateFormInput) => {
    const selection = resolveAvatarIntent(
      catalog.activeAvatar ?? null,
      history.selectedAvatar
    )
    const intent =
      controller.state.phase === 'ready'
        ? AVATAR_INTENT.PREPARED_UPLOAD
        : selection.intent
    const result = await updateCatalogAction(
      { success: false },
      {
        ...data,
        id: catalog.id,
        artistaId: artist.id,
        expectedActive: catalog.activeAvatar ?? null,
        intent,
        avatarId: selection.avatarId
      }
    )

    if (!result.success) {
      const error = result.errors?.[0]
      if (error?.entityType === AVATAR_CONFLICT) {
        toast.error('El avatar cambió en otra sesión. Se recargó el catálogo.')
        close()
        router.refresh()
        return
      }
      toast.error(error?.message ?? 'Error al guardar')
      return
    }

    if (intent === AVATAR_INTENT.PREPARED_UPLOAD) {
      try {
        await controller.enqueue(artist.id, catalog.activeAvatar ?? null)
      } catch {
        // The controller renders the upload error and retry action.
      }
    }

    reset()
    closeUpdateCatalogDialog()
    toast.success('Catálogo actualizado correctamente')
  }

  return (
    <EntityFormDialog
      open
      onOpenChange={(open) => !open && close()}
      title='Editar Catálogo'
      isDirty={isDirty}
      submit={{
        type: 'submit',
        isSubmitting,
        disabled: isSubmitting || !isDirty || !isValid,
        form: UPDATE_CATALOG_FORM_ID
      }}
    >
      <form id={UPDATE_CATALOG_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-6'>
          <div className='flex items-center gap-6'>
            <ArtistAvatarSection
              artistId={artist.id}
              currentAvatar={catalog.activeAvatar ?? null}
              autoEnqueue={false}
              avatars={history.avatars}
              selectedIndex={history.selectedIndex}
              onSelectIndex={(index) => {
                history.selectIndex(index)
                const nextSelection = resolveAvatarIntent(
                  catalog.activeAvatar ?? null,
                  history.avatars[index] ?? null
                )
                const nextIntent = nextSelection.intent
                setValue('intent', nextIntent, { shouldDirty: true })
                setValue('avatarId', nextSelection.avatarId, {
                  shouldDirty: true
                })
              }}
              onPreparedUpload={() =>
                setValue('intent', AVATAR_INTENT.PREPARED_UPLOAD, {
                  shouldDirty: true
                })
              }
              controller={controller}
            />
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-semibold'>{artist.pseudonimo}</h3>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8'
                  onClick={() => openUpdateArtistDialog(artist)}
                  title='Editar información del artista'
                >
                  <IconPencil className='h-4 w-4' />
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
                    <IconMapPin className='h-3 w-3' />
                    {[artist.ciudad, artist.pais].filter(Boolean).join(', ')}
                  </span>
                )}
                {artist.correo && (
                  <span className='flex items-center gap-1'>
                    <IconMail className='h-3 w-3' />
                    {artist.correo}
                  </span>
                )}
              </div>
            </div>
          </div>
          {history.error && <p role='alert'>{history.error}</p>}

          <FieldGroup>
            <Field className='space-y-2'>
              <FieldLabel htmlFor='descripcion-textarea'>
                Descripción
              </FieldLabel>
              <Controller
                name='descripcion'
                control={control}
                render={({ field }) => (
                  <Textarea
                    id='descripcion-textarea'
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder='Descripción del artista para el catálogo...'
                    className='min-h-50'
                  />
                )}
              />
            </Field>
            <div className='flex items-center justify-center gap-6'>
              <div className='flex items-center gap-2'>
                <Controller
                  name='destacado'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Destacado</Label>
              </div>
              <div className='flex items-center gap-2'>
                <Controller
                  name='activo'
                  control={control}
                  render={({ field }) => (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={hasPendingAvatar || !hasAvatar}
                          />
                        }
                      />
                      {!hasAvatar && (
                        <TooltipContent side='top'>
                          Debe subir un avatar antes de activar la entrada
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )}
                />
                <Label>Activo</Label>
              </div>
            </div>
          </FieldGroup>
        </div>
      </form>
    </EntityFormDialog>
  )
}

export function UpdateCatalogDialog() {
  const catalog = useCatalogDialog((state) => state.selectedCatalog)
  const artist = useCatalogDialog((state) => state.selectedArtist)

  if (!catalog || !artist) return null

  return (
    <>
      <UpdateArtistDialog />
      <UpdateCatalogDialogForm
        key={`${catalog.id}-${catalog.activeAvatar?.id ?? 'none'}`}
        catalog={catalog}
        artist={artist}
      />
    </>
  )
}

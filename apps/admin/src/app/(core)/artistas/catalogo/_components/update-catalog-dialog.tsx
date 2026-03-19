'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPencil, IconMapPin, IconMail } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { ArtistAvatar } from './artist-avatar'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { updateCatalogAction } from '../_actions/update-catalog.action'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { useCatalogDialog } from '../_store/catalog-dialog-store'
import {
  catalogUpdateFormSchema,
  CatalogUpdateFormInput
} from '../_schemas/catalog.schema'
import { UpdateArtistDialog } from '../../_components/update-artist-dialog'
import { useArtistDialog } from '../../_store/artist-dialog-store'
import { UPDATE_CATALOG_FORM_ID } from '../_constants'

export function UpdateCatalogDialog() {
  const catalog = useCatalogDialog((s) => s.selectedCatalog)
  const artist = useCatalogDialog((s) => s.selectedArtist)
  const isUpdateCatalogOpen = useCatalogDialog((s) => s.isUpdateCatalogOpen)
  const closeUpdateCatalogDialog = useCatalogDialog(
    (s) => s.closeUpdateCatalogDialog
  )

  const openUpdateArtistDialog = useArtistDialog(
    (s) => s.openUpdateArtistDialog
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting }
  } = useForm<CatalogUpdateFormInput>({
    resolver: zodResolver(catalogUpdateFormSchema),
    values: {
      avatarUrl: catalog?.avatarUrl ?? '',
      descripcion: catalog?.descripcion ?? '',
      activo: catalog?.activo ?? true,
      destacado: catalog?.destacado ?? false
    }
  })

  if (!catalog || !artist) return null

  const onSubmit = async (data: CatalogUpdateFormInput) => {
    try {
      const result = await updateCatalogAction(
        { success: false },
        {
          ...data,
          id: catalog.id,
          artistaId: artist.id
        }
      )

      if (!result.success) {
        toast.error(result.errors?.[0]?.message ?? 'Error al guardar')
      }

      closeUpdateCatalogDialog()
      toast.success('Catálogo actualizado correctamente')
    } finally {
      reset()
    }
  }

  return (
    <>
      <UpdateArtistDialog />
      <EntityFormDialog
        open={isUpdateCatalogOpen}
        onOpenChange={(open) => !open && closeUpdateCatalogDialog()}
        title='Editar Catálogo'
        isDirty={isDirty}
        submit={{
          isSubmitting,
          disabled: isSubmitting || !isDirty || !isValid,
          form: UPDATE_CATALOG_FORM_ID
        }}
      >
        <form id={UPDATE_CATALOG_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-6'>
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
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label>Activo</Label>
                </div>
              </div>
            </FieldGroup>
          </div>
        </form>
      </EntityFormDialog>
    </>
  )
}

'use client'

import { useArtistDialog } from '../_store/artist-dialog-store'
import { updateArtistaAction } from '../_actions/update-artista.action'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { ArtistFormLayout } from './artist-form-layout'
import { useForm, useFormState, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { artistUpdateFormSchema } from '../_schemas/artista.schema'
import type { ArtistUpdateFormInput } from '../_schemas/artista.schema'
import { UPDATE_ARTIST_FORM_ID } from '../_constants'

export function UpdateArtistDialog() {
  const isUpdateArtistOpen = useArtistDialog((s) => s.isUpdateArtistOpen)
  const closeUpdateArtistDialog = useArtistDialog(
    (s) => s.closeUpdateArtistDialog
  )
  const artist = useArtistDialog((s) => s.selectedArtist)

  const methods = useForm<ArtistUpdateFormInput>({
    resolver: zodResolver(artistUpdateFormSchema),
    values: {
      ...artist,
      historialFlags: {
        pseudonimo: false,
        correo: false,
        ciudad: false,
        pais: false,
        rrss: false
      }
    },
    mode: 'onChange'
  })

  // NOTE: isValid is always false, identify why
  const { isValid, isDirty, isSubmitting } = useFormState({
    control: methods.control
  })

  if (!artist) {
    return null
  }

  const onSubmit = async (data: ArtistUpdateFormInput) => {
    try {
      const result = await updateArtistaAction(
        { success: false, data: artist },
        data
      )

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al actualizar el artista'
        )
        return
      }

      closeUpdateArtistDialog()
      toast.success('Artista actualizado correctamente')
    } finally {
      methods.reset()
    }
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isUpdateArtistOpen}
        onOpenChange={(open) => !open && closeUpdateArtistDialog()}
        title='Editar artista'
        isDirty={isDirty}
        submit={{
          form: UPDATE_ARTIST_FORM_ID,
          isSubmitting,
          disabled: isSubmitting || !isDirty || !isValid
        }}
      >
        <form
          id={UPDATE_ARTIST_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <ArtistFormLayout check />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

'use client'

import { toast } from 'sonner'
import { useForm, useFormState, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

import { useArtistDialog } from '../_store/artist-dialog-store'
import { updateArtistaAction } from '../_actions/update-artista.action'
import {
  artistUpdateFormSchema,
  type ArtistUpdateFormInput
} from '../_schemas/artista.schema'
import { UPDATE_ARTIST_FORM_ID } from '../_constants'

import { ArtistFormLayout } from './artist-form-layout'

export function UpdateArtistDialog() {
  const isUpdateArtistOpen = useArtistDialog((s) => s.isUpdateArtistOpen)
  const closeUpdateArtistDialog = useArtistDialog(
    (s) => s.closeUpdateArtistDialog
  )
  const artist = useArtistDialog((s) => s.selectedArtist)

  const methods = useForm<ArtistUpdateFormInput>({
    resolver: zodResolver(artistUpdateFormSchema),
    values: {
      nombre: artist?.nombre || '',
      pseudonimo: artist?.pseudonimo || '',
      rut: artist?.rut || '',
      telefono: artist?.telefono || '',
      correo: artist?.correo || '',
      ciudad: artist?.ciudad || '',
      pais: artist?.pais || '',
      rrss: artist?.rrss ?? null,
      estadoId: artist?.estadoId || 1,
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
          type: 'submit',
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

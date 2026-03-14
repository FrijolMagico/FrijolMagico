'use client'

import { Button } from '@/shared/components/ui/button'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { updateArtistaAction } from '../_actions/update-artista.action'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { ArtistFormLayout } from './artist-form-layout'
import { useForm, useFormState, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { artistEditFormSchema } from '../_schemas/artista.schema'
import type { ArtistEditFormInput } from '../_schemas/artista.schema'
import { EDIT_ARTIST_FORM_ID } from '../_constants'

export function EditArtistDialog() {
  const isOpen = useArtistDialog((s) => s.editDialogOpen)
  const closeEditDialog = useArtistDialog((s) => s.closeEditDialog)
  const artist = useArtistDialog((s) => s.selectedArtistData)

  const methods = useForm<ArtistEditFormInput>({
    resolver: zodResolver(artistEditFormSchema),
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

  const onSubmit = async (data: ArtistEditFormInput) => {
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

      closeEditDialog()
      toast.success('Artista actualizado correctamente')
    } finally {
      methods.reset()
    }
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isOpen}
        onOpenChange={(open) => !open && closeEditDialog()}
        title='Editar Artista'
        footer={{
          close: (
            <Button type='button' variant='outline'>
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              type='submit'
              form={EDIT_ARTIST_FORM_ID}
              disabled={!isDirty || !isValid || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          )
        }}
      >
        <form
          id={EDIT_ARTIST_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <ArtistFormLayout check />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

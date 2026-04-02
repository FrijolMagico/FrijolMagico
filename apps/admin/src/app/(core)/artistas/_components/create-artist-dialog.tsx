'use client'

import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { createArtistaAction } from '../_actions/create-artista.action'
import { toast } from 'sonner'
import { ArtistFormLayout } from './artist-form-layout'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArtistInsertInput,
  artistInsertSchema
} from '../_schemas/artista.schema'
import { CREATE_ARTIST_FORM_ID } from '../_constants'
import { toSlug } from '@/shared/lib/utils'

type CreateArtistFormData = Omit<ArtistInsertInput, 'slug'>

export function CreateArtistDialog() {
  const isCreateArtistOpen = useArtistDialog((s) => s.isCreateArtistOpen)
  const toggleCreateArtistDialog = useArtistDialog(
    (s) => s.toggleCreateArtistDialog
  )

  const methods = useForm({
    resolver: zodResolver(artistInsertSchema.omit({ slug: true })),
    defaultValues: {
      nombre: null,
      pseudonimo: '',
      rut: null,
      telefono: null,
      correo: null,
      ciudad: null,
      pais: null,
      estadoId: 1,
      rrss: null
    },
    mode: 'onChange'
  })

  const { isValid, isDirty, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: CreateArtistFormData) => {
    let success = false
    try {
      const slug = toSlug(data.pseudonimo)
      const result = await createArtistaAction(
        { success: false },
        {
          ...data,
          slug
        }
      )

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al agregar el artista'
        )
        return
      }

      success = true
      toast.success('Artista agregado correctamente')
      methods.reset()
    } finally {
      if (success) {
        toggleCreateArtistDialog(false)
      }
    }
  }

  return (
    <>
      <FormProvider {...methods}>
        <EntityFormDialog
          open={isCreateArtistOpen}
          onOpenChange={toggleCreateArtistDialog}
          title='Agregar artista'
          isDirty={isDirty}
          triggerLabel='Agregar artista'
          submit={{
            isSubmitting,
            disabled: isSubmitting || !isDirty || !isValid,
            form: CREATE_ARTIST_FORM_ID
          }}
        >
          <form
            id={CREATE_ARTIST_FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <ArtistFormLayout />
          </form>
        </EntityFormDialog>
      </FormProvider>
    </>
  )
}

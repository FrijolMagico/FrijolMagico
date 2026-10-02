'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { toSlug } from '@/shared/lib/utils'

import { useArtistDialog } from '../_store/artist-dialog-store'
import { createArtistWithPseudonymsAction } from '../_actions/artist-pseudonym-mutations.action'
import {
  type ArtistCreateFormInput,
  artistCreateFormSchema
} from '../_schemas/artista.schema'
import { CREATE_ARTIST_FORM_ID } from '../_constants'

import { ArtistFormLayout } from './artist-form-layout'

export function CreateArtistDialog() {
  const [pseudonyms, setPseudonyms] = useState<string[]>([])
  const [editorKey, setEditorKey] = useState(0)
  const isCreateArtistOpen = useArtistDialog((s) => s.isCreateArtistOpen)
  const toggleCreateArtistDialog = useArtistDialog(
    (s) => s.toggleCreateArtistDialog
  )

  const methods = useForm({
    resolver: zodResolver(artistCreateFormSchema),
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

  const onSubmit = async (data: ArtistCreateFormInput) => {
    let success = false
    try {
      const primaryPseudonym = data.pseudonimo.trim()
      const submittedPseudonyms = [...new Set(
        [...pseudonyms, primaryPseudonym].map((pseudonym) => pseudonym.trim()).filter(Boolean)
      )]
      const slug = toSlug(primaryPseudonym)
      const { pseudonimo, ...artist } = data
      void pseudonimo
      const result = await createArtistWithPseudonymsAction(
        { success: false },
        {
          artist: { ...artist, slug },
          pseudonyms: submittedPseudonyms,
          primaryPseudonym
        } as Parameters<typeof createArtistWithPseudonymsAction>[1]
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
      setPseudonyms([])
      setEditorKey((key) => key + 1)
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
            type: 'submit',
            isSubmitting,
            disabled: isSubmitting || !isDirty || !isValid,
            form: CREATE_ARTIST_FORM_ID
          }}
        >
          <form
            id={CREATE_ARTIST_FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <ArtistFormLayout
              key={editorKey}
              onCreatePseudonymsChange={({ pseudonyms: nextPseudonyms }) => setPseudonyms(nextPseudonyms)}
            />
          </form>
        </EntityFormDialog>
      </FormProvider>
    </>
  )
}

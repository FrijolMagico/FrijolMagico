'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useForm, useFormState, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

import { useArtistDialog } from '../_store/artist-dialog-store'
import {
  clearPseudonymDrafts,
  type ArtistPseudonymDraftInput
} from '../_schemas/artist-pseudonym.schema'
import {
  artistUpdateFormSchema,
  type Artist,
  type ArtistUpdateFormInput
} from '../_schemas/artista.schema'
import { updateArtistaWithPseudonymsAction } from '../_actions/update-artista.action'
import { UPDATE_ARTIST_FORM_ID } from '../_constants'

import { ArtistFormLayout } from './artist-form-layout'

export function UpdateArtistDialog() {
  const artist = useArtistDialog((s) => s.selectedArtist)
  const isOpen = useArtistDialog((s) => s.isUpdateArtistOpen)
  const close = useArtistDialog((s) => s.closeUpdateArtistDialog)

  if (!artist) return null

  return (
    <UpdateArtistDialogForm
      key={artist.id}
      artist={artist}
      isOpen={isOpen}
      close={close}
    />
  )
}

function UpdateArtistDialogForm({
  artist,
  isOpen,
  close
}: {
  artist: Artist
  isOpen: boolean
  close: () => void
}) {
  const [pseudonymDrafts, setPseudonymDrafts] = useState<ArtistPseudonymDraftInput[]>([])
  const [editorResetKey, setEditorResetKey] = useState(0)

  const methods = useForm<ArtistUpdateFormInput>({
    resolver: zodResolver(artistUpdateFormSchema),
    values: {
      nombre: artist.nombre || '',
      pseudonimo: artist.pseudonimo || '',
      rut: artist.rut || '',
      telefono: artist.telefono || '',
      correo: artist.correo || '',
      ciudad: artist.ciudad || '',
      pais: artist.pais || '',
      rrss: artist.rrss ?? null,
      estadoId: artist.estadoId || 1,
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

  const { isValid, isDirty, isSubmitting } = useFormState({
    control: methods.control
  })

  const discardDrafts = () => {
    setPseudonymDrafts(clearPseudonymDrafts())
    setEditorResetKey((current) => current + 1)
  }

  const closeDialog = () => {
    discardDrafts()
    close()
  }

  const onSubmit = async (data: ArtistUpdateFormInput) => {
    const result = await updateArtistaWithPseudonymsAction(
      { success: false, data: artist },
      { data, pseudonymDrafts }
    )

    if (!result.success) {
      toast.error(
        result.errors?.map((error) => error.message).join(', ') ??
          'Error al actualizar el artista'
      )
      return
    }

    discardDrafts()
    close()
    toast.success(
      result.webRevalidation === 'swr'
        ? 'Artista actualizado correctamente. Pueden tardar en aparecer en la web.'
        : 'Artista actualizado correctamente'
    )
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isOpen}
        onOpenChange={(open) => !open && closeDialog()}
        title='Editar artista'
        isDirty={isDirty || pseudonymDrafts.length > 0}
        submit={{
          type: 'submit',
          form: UPDATE_ARTIST_FORM_ID,
          isSubmitting,
          disabled: isSubmitting || (!isDirty && pseudonymDrafts.length === 0) || !isValid
        }}
      >
        <form
          id={UPDATE_ARTIST_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <ArtistFormLayout
            key={`${artist.id}-${editorResetKey}`}
            check
            artistId={artist.id}
            pseudonymEditorKey={String(editorResetKey)}
            onPseudonymDraftChange={setPseudonymDrafts}
          />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

'use client'

import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { Button } from '@/shared/components/ui/button'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { createArtistaAction } from '../_actions/create-artista.action'
import { toast } from 'sonner'
import { IconPlus } from '@tabler/icons-react'
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

const DEFUALT_FORM_DATA: CreateArtistFormData = {
  nombre: '',
  pseudonimo: '',
  rut: '',
  telefono: '',
  correo: '',
  ciudad: '',
  pais: '',
  estadoId: 1,
  rrss: null
}

export function CreateArtistDialog() {
  const isCreateArtistOpen = useArtistDialog((s) => s.isCreateArtistOpen)
  const toggleCreateArtistDialog = useArtistDialog(
    (s) => s.toggleCreateArtistDialog
  )

  const methods = useForm({
    resolver: zodResolver(artistInsertSchema.omit({ slug: true })),
    defaultValues: DEFUALT_FORM_DATA,
    mode: 'onChange'
  })

  const { isValid, isDirty, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: CreateArtistFormData) => {
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

      toggleCreateArtistDialog(false)
      toast.success('Artista agregado correctamente')
    } finally {
      methods.reset()
    }
  }

  return (
    <>
      <FormProvider {...methods}>
        <EntityFormDialog
          open={isCreateArtistOpen}
          onOpenChange={toggleCreateArtistDialog}
          title='Agregar Artista'
          trigger={
            <Button size='sm' variant='outline'>
              <IconPlus />
              Agregar artista
            </Button>
          }
          footer={{
            close: (
              <Button type='button' variant='outline' disabled={isSubmitting}>
                Cancelar
              </Button>
            ),
            submit: (
              <Button
                type='submit'
                form={CREATE_ARTIST_FORM_ID}
                disabled={!isDirty || !isValid || isSubmitting}
              >
                {isSubmitting ? 'Agregando...' : 'Agregar artista'}
              </Button>
            )
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

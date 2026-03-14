'use client'

import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { Button } from '@/shared/components/ui/button'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { addArtistaAction } from '../_actions/add-artista.action'
import { toast } from 'sonner'
import { toSlug } from '../_lib/utils'
import { IconPlus } from '@tabler/icons-react'
import { ArtistFormLayout } from './artist-form-layout'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArtistInsertInput,
  artistInsertSchema
} from '../_schemas/artista.schema'
import { ADD_ARTIST_FORM_ID } from '../_constants'

type AddArtistFormData = Omit<ArtistInsertInput, 'slug'>

const DEFUALT_FORM_DATA: AddArtistFormData = {
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

export function AddArtistDialog() {
  const addDialogOpen = useArtistDialog((s) => s.addDialogOpen)
  const closeAddDialog = useArtistDialog((s) => s.closeAddDialog)
  const openAddDialog = useArtistDialog((s) => s.openAddDialog)

  const methods = useForm({
    resolver: zodResolver(artistInsertSchema.omit({ slug: true })),
    defaultValues: DEFUALT_FORM_DATA,
    mode: 'onChange'
  })

  const { isValid, isDirty, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: AddArtistFormData) => {
    try {
      const slug = toSlug(data.pseudonimo)
      const result = await addArtistaAction(
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

      closeAddDialog()
      toast.success('Artista agregado correctamente')
    } finally {
      methods.reset()
    }
  }

  return (
    <>
      <FormProvider {...methods}>
        <EntityFormDialog
          open={addDialogOpen}
          onOpenChange={(open) => !open && closeAddDialog()}
          title='Agregar Artista'
          trigger={
            <Button size='sm' variant='outline' onClick={() => openAddDialog()}>
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
                form={ADD_ARTIST_FORM_ID}
                disabled={!isDirty || !isValid || isSubmitting}
              >
                {isSubmitting ? 'Agregando...' : 'Agregar artista'}
              </Button>
            )
          }}
        >
          <form
            id={ADD_ARTIST_FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <ArtistFormLayout />
          </form>
        </EntityFormDialog>
      </FormProvider>
    </>
  )
}

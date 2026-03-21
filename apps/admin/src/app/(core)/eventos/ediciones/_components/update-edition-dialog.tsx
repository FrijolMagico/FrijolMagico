'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { saveEditionWithDaysAction } from '../_actions/save-edition-with-days.action'
import { UPDATE_EDITION_FORM_ID } from '../_constants'
import {
  edicionRootFormSchema,
  type EdicionRootFormInput
} from '../_schemas/edition-composite.schema'
import type { Place } from '../_schemas/place.schema'
import { useEditionDialog } from '../_store/edition-dialog-store'
import type { EventoLookup } from '../_types'
import { EditionFormLayout } from './edition-form-layout'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'

interface UpdateEditionDialogProps {
  eventos: EventoLookup[]
  lugares: Place[]
}

const emptyForm: EdicionRootFormInput = {
  eventoId: undefined as never,
  numeroEdicion: '',
  nombre: null,
  days: []
}

export function UpdateEditionDialog({
  eventos,
  lugares
}: UpdateEditionDialogProps) {
  const isOpen = useEditionDialog((state) => state.isUpdateEditionOpen)
  const closeUpdateEditionDialog = useEditionDialog(
    (state) => state.closeUpdateEditionDialog
  )
  const selectedEdition = useEditionDialog((state) => state.selectedEdition)

  const methods = useForm<EdicionRootFormInput>({
    resolver: zodResolver(edicionRootFormSchema),
    values: selectedEdition
      ? {
          eventoId: selectedEdition.eventoId,
          numeroEdicion: selectedEdition.numeroEdicion,
          nombre: selectedEdition.nombre ?? null,
          days: selectedEdition.days
        }
      : emptyForm,
    mode: 'onChange'
  })

  const { isDirty, isValid, isSubmitting } = useFormState({
    control: methods.control
  })

  if (!selectedEdition) {
    return null
  }

  const onSubmit = async (data: EdicionRootFormInput) => {
    const result = await saveEditionWithDaysAction(
      { success: false },
      {
        id: selectedEdition.id,
        posterUrl: selectedEdition.posterUrl ?? null,
        ...data
      }
    )

    if (!result.success) {
      toast.error(result.errors?.[0]?.message ?? 'Error al actualizar')
      return
    }

    toast.success('Edición actualizada')
    closeUpdateEditionDialog()
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isOpen}
        onOpenChange={(open) => !open && closeUpdateEditionDialog()}
        title='Editar edición'
        isDirty={isDirty}
        className='sm:max-w-3xl'
        close={{ label: 'Cancelar' }}
        submit={{
          form: UPDATE_EDITION_FORM_ID,
          label: 'Guardar cambios',
          disabled: !isDirty || !isValid || isSubmitting,
          isSubmitting
        }}
      >
        <form
          id={UPDATE_EDITION_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <EditionFormLayout
            mode='update'
            eventos={eventos}
            lugares={lugares}
            selectedEdition={selectedEdition}
          />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

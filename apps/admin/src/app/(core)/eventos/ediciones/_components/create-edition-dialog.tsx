'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { saveEditionWithDaysAction } from '../_actions/save-edition-with-days.action'
import { CREATE_EDITION_FORM_ID } from '../_constants'
import {
  edicionRootFormSchema,
  type EdicionRootFormInput
} from '../_schemas/edition-composite.schema'
import type { Place } from '../_schemas/place.schema'
import { useEditionDialog } from '../_store/edition-dialog-store'
import type { EventoLookup } from '../_types'
import { EditionFormLayout } from './edition-form-layout'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

interface CreateEditionDialogProps {
  eventos: EventoLookup[]
  lugares: Place[]
}

const emptyForm: EdicionRootFormInput = {
  eventoId: undefined as never,
  numeroEdicion: '',
  nombre: null,
  days: []
}

export function CreateEditionDialog({
  eventos,
  lugares
}: CreateEditionDialogProps) {
  const isOpen = useEditionDialog((state) => state.isCreateEditionOpen)
  const toggleCreateEditionDialog = useEditionDialog(
    (state) => state.toggleCreateEditionDialog
  )

  const methods = useForm<EdicionRootFormInput>({
    resolver: zodResolver(edicionRootFormSchema),
    defaultValues: emptyForm,
    mode: 'onChange'
  })

  const { isDirty, isValid, isSubmitting } = useFormState({
    control: methods.control
  })

  const handleOpenChange = (open: boolean) => {
    toggleCreateEditionDialog(open)

    if (!open) {
      methods.reset(emptyForm)
    }
  }

  const onSubmit = async (data: EdicionRootFormInput) => {
    const result = await saveEditionWithDaysAction(
      { success: false },
      { id: null, posterUrl: null, ...data }
    )

    if (!result.success) {
      toast.error(result.errors?.[0]?.message ?? 'Error al crear')
      return
    }

    toast.success('Edición creada')
    methods.reset(emptyForm)
    handleOpenChange(false)
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title='Nueva edición'
        triggerLabel='Agregar Edición'
        isDirty={isDirty}
        className='sm:max-w-3xl'
        close={{ label: 'Cancelar' }}
        submit={{
          type: 'submit',
          form: CREATE_EDITION_FORM_ID,
          label: 'Crear edición',
          disabled: !isDirty || !isValid || isSubmitting,
          isSubmitting
        }}
      >
        <form
          id={CREATE_EDITION_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <EditionFormLayout
            mode='create'
            eventos={eventos}
            lugares={lugares}
          />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

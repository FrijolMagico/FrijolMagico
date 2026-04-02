'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { CREATE_COLLECTIVE_FORM_ID } from '../_constants'
import { createCollectiveAction } from '../_actions/create-collective.action'
import {
  collectiveFormSchema,
  type CollectiveFormInput
} from '../_schemas/collective.schema'
import { useCollectiveStore } from '../_store/use-collective-store'
import { CollectiveFormLayout } from './collective-form-layout'

function getDefaultValues(): CollectiveFormInput {
  return {
    nombre: '',
    descripcion: '',
    correo: '',
    activo: true
  }
}

function toNullableString(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

export function CollectiveCreateDialog() {
  const isCreateCollectiveOpen = useCollectiveStore(
    (state) => state.isCreateCollectiveOpen
  )
  const toggleCreateCollectiveDialog = useCollectiveStore(
    (state) => state.toggleCreateCollectiveDialog
  )

  const methods = useForm<CollectiveFormInput>({
    resolver: zodResolver(collectiveFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: CollectiveFormInput) => {
    const result = await createCollectiveAction(
      { success: false },
      {
        nombre: data.nombre.trim(),
        descripcion: toNullableString(data.descripcion),
        correo: toNullableString(data.correo),
        activo: data.activo
      }
    )

    if (!result.success) {
      toast.error(
        result.errors?.map((error) => error.message).join(', ') ??
          'No se pudo crear la agrupación'
      )
      return
    }

    toast.success('Agrupación creada correctamente')
    methods.reset(getDefaultValues())
    toggleCreateCollectiveDialog(false)
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isCreateCollectiveOpen}
        onOpenChange={(open) => {
          if (!open) {
            methods.reset(getDefaultValues())
          }

          toggleCreateCollectiveDialog(open)
        }}
        title='Nueva agrupación'
        triggerLabel='Nueva agrupación'
        description='Completá los datos básicos para registrar una nueva agrupación.'
        isDirty={isDirty}
        submit={{
          form: CREATE_COLLECTIVE_FORM_ID,
          disabled: isSubmitting || !isDirty || !isValid,
          isSubmitting
        }}
      >
        <form
          id={CREATE_COLLECTIVE_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <CollectiveFormLayout />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

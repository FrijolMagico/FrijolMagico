'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { CREATE_AGRUPACION_FORM_ID } from '../_constants'
import { createAgrupacionAction } from '../_actions/create-agrupacion.action'
import {
  agrupacionFormSchema,
  type AgrupacionFormInput
} from '../_schemas/agrupacion.schema'
import { useAgrupacionDialogStore } from '../_store/agrupacion-dialog-store'
import { AgrupacionFormLayout } from './agrupacion-form-layout'

function getDefaultValues(): AgrupacionFormInput {
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

export function AgrupacionCreateDialog() {
  const isCreateOpen = useAgrupacionDialogStore((state) => state.isCreateOpen)
  const openCreateDialog = useAgrupacionDialogStore(
    (state) => state.openCreateDialog
  )
  const closeCreateDialog = useAgrupacionDialogStore(
    (state) => state.closeCreateDialog
  )

  const methods = useForm<AgrupacionFormInput>({
    resolver: zodResolver(agrupacionFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: AgrupacionFormInput) => {
    const result = await createAgrupacionAction(
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
    closeCreateDialog()
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (open) {
            openCreateDialog()
            return
          }

          methods.reset(getDefaultValues())
          closeCreateDialog()
        }}
        title='Nueva agrupación'
        triggerLabel='Nueva agrupación'
        description='Completá los datos básicos para registrar una nueva agrupación.'
        isDirty={isDirty}
        submit={{
          form: CREATE_AGRUPACION_FORM_ID,
          disabled: isSubmitting || !isDirty || !isValid,
          isSubmitting
        }}
      >
        <form
          id={CREATE_AGRUPACION_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <AgrupacionFormLayout />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

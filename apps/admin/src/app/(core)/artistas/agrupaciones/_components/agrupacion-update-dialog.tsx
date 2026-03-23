'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { UPDATE_AGRUPACION_FORM_ID } from '../_constants'
import { updateAgrupacionAction } from '../_actions/update-agrupacion.action'
import {
  agrupacionFormSchema,
  type AgrupacionFormInput
} from '../_schemas/agrupacion.schema'
import { useAgrupacionDialogStore } from '../_store/agrupacion-dialog-store'
import { AgrupacionFormLayout } from './agrupacion-form-layout'

function toNullableString(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getDefaultValues(
  selectedAgrupacion: ReturnType<
    typeof useAgrupacionDialogStore.getState
  >['selectedAgrupacion']
): AgrupacionFormInput {
  return {
    nombre: selectedAgrupacion?.nombre ?? '',
    descripcion: selectedAgrupacion?.descripcion ?? '',
    correo: selectedAgrupacion?.correo ?? '',
    activo: selectedAgrupacion?.activo ?? true
  }
}

export function AgrupacionUpdateDialog() {
  const isUpdateOpen = useAgrupacionDialogStore((state) => state.isUpdateOpen)
  const closeUpdateDialog = useAgrupacionDialogStore(
    (state) => state.closeUpdateDialog
  )
  const selectedAgrupacion = useAgrupacionDialogStore(
    (state) => state.selectedAgrupacion
  )

  const methods = useForm<AgrupacionFormInput>({
    resolver: zodResolver(agrupacionFormSchema),
    values: getDefaultValues(selectedAgrupacion),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  if (!selectedAgrupacion) {
    return null
  }

  const onSubmit = async (data: AgrupacionFormInput) => {
    const result = await updateAgrupacionAction(
      { success: false },
      {
        id: selectedAgrupacion.id,
        nombre: data.nombre.trim(),
        descripcion: toNullableString(data.descripcion),
        correo: toNullableString(data.correo),
        activo: data.activo
      }
    )

    if (!result.success) {
      toast.error(
        result.errors?.map((error) => error.message).join(', ') ??
          'No se pudo actualizar la agrupación'
      )
      return
    }

    toast.success('Agrupación actualizada correctamente')
    methods.reset(getDefaultValues(selectedAgrupacion))
    closeUpdateDialog()
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isUpdateOpen}
        onOpenChange={(open) => {
          if (!open) {
            methods.reset(getDefaultValues(selectedAgrupacion))
            closeUpdateDialog()
          }
        }}
        title='Editar agrupación'
        description='Actualizá los datos básicos de la agrupación seleccionada.'
        isDirty={isDirty}
        submit={{
          form: UPDATE_AGRUPACION_FORM_ID,
          disabled: isSubmitting || !isDirty || !isValid,
          isSubmitting
        }}
      >
        <form
          id={UPDATE_AGRUPACION_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <AgrupacionFormLayout />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

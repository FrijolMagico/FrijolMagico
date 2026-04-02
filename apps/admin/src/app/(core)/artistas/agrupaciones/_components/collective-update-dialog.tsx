'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { UPDATE_COLLECTIVE_FORM_ID } from '../_constants'
import { upsertCollectiveWithMembersAction } from '../_actions/upsert-collective-with-members.action'
import {
  collectiveFormSchema,
  type CollectiveFormInput
} from '../_schemas/collective.schema'
import type { CollectiveRow } from '../_types/collective.types'
import { CollectiveFormLayout } from './collective-form-layout'

interface CollectiveUpdateDialogProps {
  collective: CollectiveRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollectiveUpdateDialog({
  collective,
  open,
  onOpenChange
}: CollectiveUpdateDialogProps) {
  const methods = useForm<CollectiveFormInput>({
    resolver: zodResolver(collectiveFormSchema),
    defaultValues: {
      nombre: collective?.nombre ?? '',
      descripcion: collective?.descripcion ?? '',
      correo: collective?.correo ?? '',
      activo: collective?.activo ?? true
    },
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  if (!collective) {
    return null
  }

  const onSubmit = async (data: CollectiveFormInput) => {
    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        collectiveId: collective.id,
        fields: {
          ...data,
          nombre: data.nombre.trim()
        },
        pendingAdds: [],
        pendingUpdates: [],
        pendingRemovals: []
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
    methods.reset()
    onOpenChange(false)
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={open}
        onOpenChange={onOpenChange}
        title='Editar agrupación'
        description='Actualizá los datos básicos de la agrupación seleccionada.'
        isDirty={isDirty}
        submit={{
          form: UPDATE_COLLECTIVE_FORM_ID,
          disabled: isSubmitting || !isDirty || !isValid,
          isSubmitting
        }}
      >
        <form
          id={UPDATE_COLLECTIVE_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <CollectiveFormLayout />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

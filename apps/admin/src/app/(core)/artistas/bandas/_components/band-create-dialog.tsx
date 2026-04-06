'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'

import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'

import { BAND_FORM_ID } from '../_constants'
import { createBandaAction } from '../_actions/create-banda.action'
import { bandFormSchema, type BandFormInput } from '../_schemas/banda.schema'
import { useBandDialogStore } from '../_store/band-dialog-store'
import { BandFormLayout } from './band-form-layout'

function toNullableString(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getDefaultValues(): BandFormInput {
  return {
    name: '',
    description: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    active: true
  }
}

export function BandCreateDialog() {
  const isCreateBandOpen = useBandDialogStore((state) => state.isCreateBandOpen)
  const toggleCreateBandDialog = useBandDialogStore(
    (state) => state.toggleCreateBandDialog
  )

  const methods = useForm<BandFormInput, undefined, BandFormInput>({
    resolver: zodResolver(bandFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: BandFormInput) => {
    const payload = {
      name: data.name.trim(),
      description: toNullableString(data.description),
      email: toNullableString(data.email),
      phone: toNullableString(data.phone),
      city: toNullableString(data.city),
      country: toNullableString(data.country),
      active: data.active
    }

    const result = await createBandaAction(payload)

    if (!result.success) {
      toast.error(
        result.errors?.map((error) => error.message).join(', ') ??
          'No se pudo crear la banda'
      )
      return
    }

    toast.success('Banda creada correctamente')
    methods.reset(getDefaultValues())
    toggleCreateBandDialog(false)
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isCreateBandOpen}
        onOpenChange={(open) => {
          if (!open) {
            methods.reset(getDefaultValues())
          }

          toggleCreateBandDialog(open)
        }}
        title='Nueva banda'
        triggerLabel='Nueva banda'
        description='Completa los datos básicos para registrar una nueva banda.'
        isDirty={isDirty}
        submit={{
          type: 'submit',
          form: BAND_FORM_ID,
          disabled: isSubmitting || !isDirty || !isValid,
          isSubmitting
        }}
      >
        <form id={BAND_FORM_ID} onSubmit={methods.handleSubmit(onSubmit)}>
          <BandFormLayout />
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { BAND_FORM_ID } from '../_constants'
import { updateBandaAction } from '../_actions/update-banda.action'
import { bandFormSchema, type BandFormInput } from '../_schemas/banda.schema'
import { useBandDialogStore } from '../_store/band-dialog-store'
import { BandFormLayout } from './band-form-layout'

function toNullableString(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getDefaultValues(band: {
  name?: string
  description?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  country?: string | null
  active?: boolean
}): BandFormInput {
  return {
    name: band.name ?? '',
    description: band.description ?? '',
    email: band.email ?? '',
    phone: band.phone ?? '',
    city: band.city ?? '',
    country: band.country ?? '',
    active: band.active ?? true
  }
}

export function BandUpdateDialog() {
  const selectedBand = useBandDialogStore((state) => state.selectedBand)
  const isUpdateBandOpen = useBandDialogStore((state) => state.isUpdateBandOpen)
  const closeUpdateBandDialog = useBandDialogStore(
    (state) => state.closeUpdateBandDialog
  )

  const methods = useForm<BandFormInput, undefined, BandFormInput>({
    resolver: zodResolver(bandFormSchema),
    values: getDefaultValues(selectedBand ?? {}),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  if (!selectedBand) {
    return null
  }

  const onSubmit = async (data: BandFormInput) => {
    const payload = {
      id: selectedBand.id,
      name: data.name.trim(),
      description: toNullableString(data.description),
      email: toNullableString(data.email),
      phone: toNullableString(data.phone),
      city: toNullableString(data.city),
      country: toNullableString(data.country),
      active: data.active
    }

    const result = await updateBandaAction(payload)

    if (!result.success) {
      toast.error(
        result.errors?.map((error) => error.message).join(', ') ??
          'No se pudo actualizar la banda'
      )
      return
    }

    closeUpdateBandDialog()
    toast.success('Banda actualizada correctamente')
    methods.reset(getDefaultValues(selectedBand))
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isUpdateBandOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeUpdateBandDialog()
          }
        }}
        title='Editar banda'
        description='Actualiza la información visible de la banda.'
        isDirty={isDirty}
        submit={{
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

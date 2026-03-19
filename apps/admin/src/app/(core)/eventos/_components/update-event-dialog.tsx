'use client'

import { useEventDialog } from '../_store/event-dialog-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { CREATE_EVENT_FORM_ID, UPDATE_EVENT_FORM_ID } from '../_constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { type EventFormInput, eventFormSchema } from '../_schemas/event.schema'
import { toast } from 'sonner'
import { updateEventAction } from '../_actions/update-event.action'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { ORGANIZATION_ID } from '@/core/organizacion/_constants'
import { toSlug } from '@/shared/lib/utils'

export function UpdateCreateEventDialog() {
  const selectedEvent = useEventDialog((s) => s.selectedEvent)
  const isUpdateEventOpen = useEventDialog((s) => s.isUpdateEventOpen)
  const closeUpdateEventDialog = useEventDialog((s) => s.closeUpdateEventDialog)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting, errors }
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      nombre: selectedEvent?.nombre ?? '',
      descripcion: selectedEvent?.descripcion ?? null
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: EventFormInput) => {
    try {
      const result = await updateEventAction(
        {
          success: false
        },
        {
          ...data,
          id: selectedEvent?.id,
          organizacionId: ORGANIZATION_ID,
          slug: toSlug(data.nombre)
        }
      )

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'No se pudo actualizar el Evento'
        )
        return
      }

      closeUpdateEventDialog()
      toast.success('Evento actualizado exitósamente')
    } finally {
      reset()
    }
  }

  return (
    <EntityFormDialog
      open={isUpdateEventOpen}
      onOpenChange={(open) => !open && closeUpdateEventDialog()}
      title='Actualizar evento'
      triggerLabel='Actualizar evento'
      isDirty={isDirty}
      submit={{
        form: UPDATE_EVENT_FORM_ID,
        disabled: !isDirty || !isValid || isSubmitting,
        isSubmitting
      }}
    >
      <form id={CREATE_EVENT_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='nombre'>
              Nombre <span className='text-destructive'>*</span>
            </FieldLabel>
            <Input
              id='nombre'
              {...register('nombre')}
              placeholder='Nombre del evento'
              aria-invalid={!!errors.nombre}
            />
            {errors.nombre && (
              <FieldError className='text-destructive text-sm'>
                {errors.nombre.message}
              </FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
            <Textarea
              id='descripcion'
              {...register('descripcion')}
              placeholder='Breve descripción del evento'
              rows={4}
            />
            {errors.descripcion && (
              <FieldError className='text-destructive text-sm'>
                {errors.descripcion.message}
              </FieldError>
            )}
          </Field>
        </FieldGroup>
      </form>
    </EntityFormDialog>
  )
}

'use client'

import { useEventDialog } from '../_store/event-dialog-store'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { CREATE_EVENT_FORM_ID } from '../_constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { type EventFormInput, eventFormSchema } from '../_schemas/event.schema'
import { createEventAction } from '../_actions/create-event.action'
import { toast } from 'sonner'
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

export function CreateEventDialog() {
  const isCreateEventOpen = useEventDialog((s) => s.isCreateEventOpen)
  const toggleCreateEventDialog = useEventDialog(
    (s) => s.toggleCreateEventDialog
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting, errors }
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      nombre: '',
      descripcion: null
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: EventFormInput) => {
    try {
      const result = await createEventAction(
        {
          success: false
        },
        {
          ...data,
          organizacionId: ORGANIZATION_ID,
          slug: toSlug(data.nombre)
        }
      )

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'No se pudo crear el Evento'
        )
        return
      }

      toggleCreateEventDialog(false)
      toast.success('Evento creado exitósamente')
    } finally {
      reset()
    }
  }

  return (
    <EntityFormDialog
      open={isCreateEventOpen}
      onOpenChange={toggleCreateEventDialog}
      title='Crea un nuevo evento'
      triggerLabel='Crear evento'
      isDirty={isDirty}
      submit={{
        type: 'submit',
        form: CREATE_EVENT_FORM_ID,
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

'use client'

import { Button } from '@/shared/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useEventDialog } from '../_store/event-dialog-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { CREATE_EVENT_FORM_ID } from '../_constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { type EventFormInput, eventFormSchema } from '../_schemas/event.schema'
import { createEventAction } from '../_actions/create-event.action'
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
import { ORGANIZATION_ID } from '@/admin/organizacion/_constants'
import { toSlug } from '@/shared/lib/utils'

export function EventDialog() {
  const selectedEvent = useEventDialog((s) => s.selectedEvent)
  const isEventDialogOpen = useEventDialog((s) => s.isEventDialogOpen)
  const closeEventDialog = useEventDialog((s) => s.closeEventDialog)
  const openEventDialog = useEventDialog((s) => s.openEventDialog)

  const isCreation = selectedEvent === null

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting, errors }
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      nombre: selectedEvent?.nombre ?? '',
      descripcion: selectedEvent?.descripcion ?? ''
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: EventFormInput) => {
    try {
      const action = isCreation ? createEventAction : updateEventAction

      const result = await action(
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
            : `No se pudo ${isCreation ? 'crear' : 'actualizar'} el Evento`
        )
        return
      }

      closeEventDialog()
      toast.success(
        `Evento ${isCreation ? 'creado' : 'actualizado'} exitósamente`
      )
    } finally {
      reset()
    }
  }

  return (
    <EntityFormDialog
      open={isEventDialogOpen}
      onOpenChange={closeEventDialog}
      title={`${isCreation ? 'Crear' : 'Actualizar'} Evento`}
      trigger={
        <Button
          size='sm'
          variant='outline'
          onClick={() => openEventDialog(null)}
        >
          <IconPlus />
          Crear Evento
        </Button>
      }
      footer={{
        close: (
          <Button type='button' variant='outline'>
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            type='submit'
            form={CREATE_EVENT_FORM_ID}
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {isSubmitting
              ? `${isCreation ? 'Creando' : 'Agregando'}...`
              : `${isCreation ? 'Crear' : 'Actualizar'} artista`}
          </Button>
        )
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

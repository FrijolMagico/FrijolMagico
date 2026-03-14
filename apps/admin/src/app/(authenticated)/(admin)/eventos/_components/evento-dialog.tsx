'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useEventoDialog } from '../_store/evento-dialog-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import {
  eventoFormSchema,
  type EventoFormInput
} from '../_schemas/evento.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { addEventoAction } from '../_actions/add-evento.action'
import { updateEventoAction } from '../_actions/update-evento.action'
import type { EventoEntry } from '../_types'
import { IconLoader2 } from '@tabler/icons-react'

interface EventoFormContentProps {
  onSuccess: () => void
  onCancel: () => void
  evento: EventoEntry | null
}

function EventoFormContent({
  onSuccess,
  onCancel,
  evento
}: EventoFormContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm<EventoFormInput>({
    resolver: zodResolver(eventoFormSchema),
    defaultValues: {
      nombre: evento?.nombre ?? '',
      descripcion: evento?.descripcion ?? ''
    }
  })

  const onSubmit = (data: EventoFormInput) => {
    startTransition(async () => {
      const result = await (evento
        ? updateEventoAction(
            { success: false },
            { ...data, id: Number(evento.id) }
          )
        : addEventoAction({ success: false }, data))

      if (result.success) {
        toast.success(evento ? 'Evento actualizado' : 'Evento creado')
        onSuccess()
        router.refresh()
      } else {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al guardar el evento'
        )
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col gap-4 py-4'
    >
      <div className='flex flex-col gap-2'>
        <Label htmlFor='nombre'>
          Nombre <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='nombre'
          {...register('nombre')}
          placeholder='Nombre del evento'
          disabled={isPending}
          aria-invalid={!!errors.nombre}
        />
        {errors.nombre && (
          <p className='text-destructive text-sm'>{errors.nombre.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='descripcion'>Descripción (opcional)</Label>
        <Textarea
          id='descripcion'
          {...register('descripcion')}
          placeholder='Breve descripción del evento'
          rows={4}
          disabled={isPending}
        />
        {errors.descripcion && (
          <p className='text-destructive text-sm'>
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <div className='mt-4 flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type='submit'
          disabled={isPending || (!isDirty && !!evento) || !isValid}
        >
          {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
          {evento ? 'Guardar cambios' : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}

interface EventoDialogProps {
  eventos: EventoEntry[]
}

export function EventoDialog({ eventos }: EventoDialogProps) {
  const eventoId = useEventoDialog((s) => s.selectedEventoId)
  const isOpen = useEventoDialog((s) => s.isDialogOpen)
  const close = useEventoDialog((s) => s.closeDialog)

  const evento = eventoId
    ? eventos.find((e) => e.id === eventoId) || null
    : null

  const isReady = !eventoId || evento !== null

  return (
    <EntityFormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title={evento ? 'Editar Evento' : 'Nuevo Evento'}
    >
      {isOpen && isReady && (
        <EventoFormContent
          key={evento?.id ?? 'new'}
          evento={evento}
          onSuccess={close}
          onCancel={close}
        />
      )}
    </EntityFormDialog>
  )
}

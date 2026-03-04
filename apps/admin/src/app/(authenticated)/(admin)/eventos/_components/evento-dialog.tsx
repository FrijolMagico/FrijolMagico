'use client'

import { useState } from 'react'
import { useEventoDialog } from '../_store/evento-dialog-store'
import {
  useEventoOperationStore,
  useEventoProjectionStore
} from '../_store/evento-ui-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { eventoFormSchema } from '../_schemas/evento.schema'
import { generateSlug } from '../_lib/slug-utils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { EventoEntry } from '../_types'
import { ProjectedEntity } from '@/shared/operations/projection'

interface EventoFormContentProps {
  onApply: (
    data: Omit<EventoEntry, 'id' | 'organizacionId' | 'createdAt' | 'updatedAt'>
  ) => void
  onCancel: () => void
  evento: ProjectedEntity<EventoEntry> | null
}

function EventoFormContent({
  onApply,
  onCancel,
  evento
}: EventoFormContentProps) {
  const [formData, setFormData] = useState({
    nombre: evento?.nombre || '',
    descripcion: evento?.descripcion || ''
  })

  const [errors, setErrors] = useState<{ nombre?: string }>({})

  const handleApply = () => {
    setErrors({})

    const result = eventoFormSchema.safeParse(formData)

    if (!result.success) {
      const formatted = result.error.format()
      setErrors({
        nombre: formatted.nombre?._errors[0]
      })
      return
    }

    onApply({
      nombre: formData.nombre,
      slug: generateSlug(formData.nombre),
      descripcion: formData.descripcion || null
    })
  }

  return (
    <div className='space-y-4 py-2'>
      <div className='grid gap-2'>
        <Label htmlFor='nombre'>
          Nombre <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='nombre'
          value={formData.nombre}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder='Nombre del evento'
          aria-invalid={!!errors.nombre}
        />
        {errors.nombre && (
          <p className='text-destructive text-xs'>{errors.nombre}</p>
        )}
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='descripcion'>Descripción</Label>
        <Textarea
          id='descripcion'
          value={formData.descripcion}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
          }
          placeholder='Descripción del evento...'
          rows={4}
        />
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleApply}>
          {evento ? 'Guardar cambios' : 'Agregar evento'}
        </Button>
      </div>
    </div>
  )
}

export function EventoDialog() {
  const eventoId = useEventoDialog((s) => s.selectedEventoId)
  const evento = useEventoProjectionStore((s) =>
    eventoId ? s.byId[eventoId] : null
  )

  const isOpen = useEventoDialog((s) => s.isDialogOpen)
  const close = useEventoDialog((s) => s.closeDialog)
  const add = useEventoOperationStore((s) => s.add)
  const update = useEventoOperationStore((s) => s.update)

  const handleApply = (
    data: Omit<EventoEntry, 'id' | 'organizacionId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (eventoId) {
      update(eventoId, {
        ...data,
        organizacionId: evento?.organizacionId ?? 1
      })
    } else {
      const now = new Date().toISOString()
      add({
        ...data,
        organizacionId: 1,
        createdAt: now,
        updatedAt: now
      })
    }

    close()
  }

  return (
    <EntityFormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title={eventoId ? 'Editar Evento' : 'Agregar Evento'}
    >
      {isOpen && (
        <EventoFormContent
          onApply={handleApply}
          onCancel={close}
          evento={evento}
        />
      )}
    </EntityFormDialog>
  )
}

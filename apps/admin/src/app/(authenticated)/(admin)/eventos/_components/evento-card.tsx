'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { useEventoDialog } from '../_store/evento-dialog-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { deleteEventoAction } from '../_actions/delete-evento.action'
import type { EventoEntry } from '../_types'

interface EventoCardProps {
  evento: EventoEntry
}

export function EventoCard({ evento }: EventoCardProps) {
  const openDialog = useEventoDialog((s) => s.openDialog)
  const [, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', String(evento.id))
      const result = await deleteEventoAction({ success: false }, formData)
      if (!result.success && result.errors) {
        toast.error(result.errors[0]?.message ?? 'Error al eliminar el evento')
      } else {
        toast.success('Evento eliminado')
      }
    })
  }

  return (
    <Card className='flex flex-col justify-between transition-colors'>
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <CardTitle className='text-lg'>{evento.nombre}</CardTitle>
          </div>
          <ActionMenuButton
            actions={[
              {
                label: 'Editar',
                onClick: () => openDialog(evento.id)
              }
            ]}
            onDelete={handleDelete}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>
          {evento.descripcion || 'Sin descripción'}
        </p>
      </CardContent>
    </Card>
  )
}

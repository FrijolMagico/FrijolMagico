'use client'

import { useEventDialog } from '../_store/event-dialog-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { Event } from '../_schemas/event.schema'
import { useState } from 'react'
import { ConfirmationDialog } from 'src/shared/components/confirmation-dialog'

interface EventCardProps {
  event: Event
  onDelete: (id: number) => void
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const openUpdateEventDialog = useEventDialog((s) => s.openUpdateEventDialog)
  const [showAlert, setShowAlert] = useState(false)

  const handleDelete = () => {
    onDelete(event.id)
    setShowAlert(false)
  }

  return (
    <Card className='flex flex-col justify-between transition-colors'>
      <ConfirmationDialog
        open={showAlert}
        onOpenChange={setShowAlert}
        onConfirm={handleDelete}
        title='¿Eliminar evento?'
        description='Esta acción no se puede deshacer. Borrar el evento posiblemente (No me acuerdo bien la verdad jej) elimine también las ediciones y participaciones asociadas.'
      />
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <CardTitle className='text-lg'>{event.nombre}</CardTitle>
          </div>
          <ActionMenuButton
            actions={[
              {
                label: 'Editar',
                onClick: () => openUpdateEventDialog(event)
              }
            ]}
            onDelete={handleDelete}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>
          {event.descripcion || 'Sin descripción'}
        </p>
      </CardContent>
    </Card>
  )
}

'use client'

import { toast } from 'sonner'
import { useEventDialog } from '../_store/event-dialog-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { deleteEventAction } from '../_actions/delete-event.action'
import { Event } from '../_schemas/event.schema'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '@/shared/components/ui/alert-dialog'
import { IconTrashFilled } from '@tabler/icons-react'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const openEventDialog = useEventDialog((s) => s.openEventDialog)
  const [showAlert, setShowAlert] = useState(false)

  const handleDelete = async () => {
    const result = await deleteEventAction(event.id)

    if (!result.success && result.errors) {
      toast.error(
        result.errors
          ? result.errors.map((e) => e.message).join(', ')
          : 'Error al eliminar el evento'
      )
      return
    }

    setShowAlert(false)
    toast.success('Evento eliminado')
  }

  return (
    <>
      <Card className='flex flex-col justify-between transition-colors'>
        <CardHeader>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <CardTitle className='text-lg'>{event.nombre}</CardTitle>
            </div>
            <ActionMenuButton
              actions={[
                {
                  label: 'Editar',
                  onClick: () => openEventDialog(event)
                }
              ]}
              onDelete={() => setShowAlert(true)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            {event.descripcion || 'Sin descripción'}
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
              <IconTrashFilled />
            </AlertDialogMedia>
            <AlertDialogTitle>Eliminar Evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Borrar el evento posiblemente
              (No me acuerdo bien la verdad jej) elimine también las ediciones y
              participaciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant='outline'>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

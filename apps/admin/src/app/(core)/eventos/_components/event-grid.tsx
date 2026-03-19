'use client'

import { startTransition, useOptimistic } from 'react'
import { Event } from '../_schemas/event.schema'
import { EventCard } from './event-card'
import { toast } from 'sonner'
import { deleteEventAction } from '../_actions/delete-event.action'

interface EventGridProps {
  events: Event[]
}

export function EventGrid({ events }: EventGridProps) {
  const [optimisticEvents, setOptimisticEvents] = useOptimistic(
    events,
    (current, id: number) => current.filter((event) => event.id !== id)
  )

  const handleEventDeletion = (id: number) => {
    startTransition(async () => {
      setOptimisticEvents(id)
      try {
        const result = await deleteEventAction(id)
        if (result.success) toast.success('Evento eliminado exitosamente')
      } catch (error) {
        toast.error('Ocurrió un error al intentar eliminar el evento')
        console.error(error)
      }
    })
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
      {optimisticEvents.map((evento) => (
        <EventCard
          key={evento.id}
          event={evento}
          onDelete={handleEventDeletion}
        />
      ))}
    </div>
  )
}

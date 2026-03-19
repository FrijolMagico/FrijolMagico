import { getEvents } from '../_lib/get-events-data'
import { EmptyState } from '@/shared/components/empty-state'
import { CreateEventDialog } from './create-event-dialog'
import { EventGrid } from './event-grid'

export async function EventSection() {
  const events = await getEvents()

  if (!events) {
    return (
      <EmptyState
        title='Sin Eventos'
        description='Crea tu primer evento presioando el botón de Agregar Evento'
      />
    )
  }

  return (
    <div className='space-y-6'>
      <CreateEventDialog />
      <EventGrid events={events} />
    </div>
  )
}

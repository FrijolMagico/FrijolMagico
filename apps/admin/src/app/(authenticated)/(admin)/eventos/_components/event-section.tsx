import { EventCard } from './event-card'
import { getEvents } from '../_lib/get-events-data'
import { EmptyState } from '@/shared/components/empty-state'

export async function EventSection() {
  const eventos = await getEvents()

  if (!eventos) {
    return (
      <EmptyState
        title='Sin Eventos'
        description='Crea tu primer evento presioando el botón de Agregar Evento'
      ></EmptyState>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {eventos.map((evento) => (
          <EventCard key={evento.id} event={evento} />
        ))}
      </div>
    </div>
  )
}

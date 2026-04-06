import { EventSection } from './_components/event-section'

export default function EventsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>Eventos</h1>
        <p className='text-muted-foreground'>
          Gestiona los eventos de la organización.
        </p>
      </div>
      <EventSection />
    </div>
  )
}

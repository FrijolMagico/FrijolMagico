import { EventoCard } from './evento-card'
import { EventoDialog } from './evento-dialog'
import type { EventoEntry } from '../_types'
import { EventoAddBtn } from './evento-add-btn'

interface EventoSectionProps {
  eventos: EventoEntry[]
}

export function EventoSection({ eventos }: EventoSectionProps) {
  return (
    <div className='space-y-6'>
      <div className='flex'>
        <EventoAddBtn />
      </div>

      {eventos.length === 0 ? (
        <div className='flex h-40 items-center justify-center rounded-lg border border-dashed'>
          <p className='text-muted-foreground text-sm'>
            No hay eventos registrados
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {eventos.map((evento) => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}

      <EventoDialog eventos={eventos} />
    </div>
  )
}

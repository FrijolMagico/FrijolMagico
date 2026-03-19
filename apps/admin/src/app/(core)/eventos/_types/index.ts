import type { Event } from '../_schemas/event.schema'

export interface EventoEntry extends Omit<Event, 'id'> {
  id: string
}

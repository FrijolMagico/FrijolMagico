import type { Event } from '../../_schemas/event.schema'

export type { Edition, EditionDay, Place } from '../_schemas/edicion.schema'

export type EventoLookup = Pick<Event, 'id' | 'nombre' | 'slug'>

import type { Event } from '../../_schemas/event.schema'

export type { Edition } from '../_schemas/edition.schema'
export type { EditionDay } from '../_schemas/edition-day.schema'
export type { Place } from '../_schemas/place.schema'

export type EventoLookup = Pick<Event, 'id' | 'nombre' | 'slug'>

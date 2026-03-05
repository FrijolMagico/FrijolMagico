import type { Event } from '@frijolmagico/database/orm'

export type EventoEntry = Omit<Event, 'id' | 'organizacionId'> & {
  id: string
  organizacionId: number
}

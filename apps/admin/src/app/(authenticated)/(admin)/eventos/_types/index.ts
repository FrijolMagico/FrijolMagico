import type { Evento } from '@frijolmagico/database/orm'

export type EventoEntry = Omit<Evento, 'id' | 'organizacionId'> & {
  id: string
  organizacionId: number
}

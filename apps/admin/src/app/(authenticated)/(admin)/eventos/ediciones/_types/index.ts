import type {
  EventEdition,
  EventEditionDay,
  Place
} from '@frijolmagico/database/orm'

export type EdicionEntry = Omit<EventEdition, 'id' | 'eventoId'> & {
  id: string
  eventoId: string
}

export type EdicionDiaEntry = Omit<
  EventEditionDay,
  'id' | 'eventoEdicionId' | 'lugarId'
> & {
  id: string
  eventoEdicionId: string
  lugarId: string | null
}

export type LugarEntry = Omit<Place, 'id'> & {
  id: string
}

export type EdicionTableRow = EdicionEntry & {
  eventoNombre: string
  dias: string
  lugarNombre: string
  modalidad: string
  posterUrl: string | null
}

export interface EdicionFilters {
  eventoId: string | null
  search: string
}

import type {
  EventoEdicion,
  EventoEdicionDia,
  Lugar
} from '@frijolmagico/database/orm'

export type EdicionEntry = Omit<EventoEdicion, 'id' | 'eventoId'> & {
  id: string
  eventoId: string
}

export type EdicionDiaEntry = Omit<
  EventoEdicionDia,
  'id' | 'eventoEdicionId' | 'lugarId'
> & {
  id: string
  eventoEdicionId: string
  lugarId: string | null
}

export type LugarEntry = Omit<Lugar, 'id'> & {
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

import type { Edition } from '../_schemas/edicion.schema'

export interface PaginatedEdition extends Edition {
  eventoNombre: string
  dateRange: string
  firstDate: string
  lugarNombre: string | null
  modalidadLabel: string | null
}

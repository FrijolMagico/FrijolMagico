import type { EdicionEntry } from './index'

export interface PaginatedEdicion extends EdicionEntry {
  eventoNombre: string
  dateRange: string
  firstDate: string
  lugarNombre: string | null
  modalidadLabel: string | null
}

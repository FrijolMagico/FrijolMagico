import { useEdicionFilterStore } from '../_store/edicion-filter-store'
import { useEdicionPaginationStore } from '../_store/edicion-pagination-store'
import { formatEdicionFechas } from '../_lib/format-edicion-fechas'
import type { EdicionEntry, EdicionDiaEntry } from '../_types'
import type { EventoEntry } from '../../_types'

export type PaginatedEdicion = EdicionEntry & {
  eventoNombre: string
  dateRange: string
  firstDate: string
}

export function useEdicionList(
  ediciones: EdicionEntry[],
  dias: EdicionDiaEntry[],
  eventos: EventoEntry[]
): {
  paginatedEdiciones: PaginatedEdicion[]
  totalFilteredItems: number
} {
  const filters = useEdicionFilterStore((s) => s.filters)
  const page = useEdicionPaginationStore((s) => s.page)
  const pageSize = useEdicionPaginationStore((s) => s.pageSize)

  const eventosById = new Map(eventos.map((e) => [e.id, e]))

  const diasByEdicionId = new Map<string, EdicionDiaEntry[]>()
  for (const dia of dias) {
    if (!diasByEdicionId.has(dia.eventoEdicionId)) {
      diasByEdicionId.set(dia.eventoEdicionId, [])
    }
    diasByEdicionId.get(dia.eventoEdicionId)!.push(dia)
  }

  const listData: PaginatedEdicion[] = ediciones.map((edicion) => {
    const evento = eventosById.get(edicion.eventoId)

    const edicionDias = diasByEdicionId.get(edicion.id) || []
    const sortedDias = edicionDias.sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )

    const dateRange = formatEdicionFechas(sortedDias)
    const firstDate = sortedDias[0]?.fecha ?? ''

    return {
      ...edicion,
      eventoNombre: evento?.nombre ?? '',
      dateRange,
      firstDate
    }
  })

  let filtered = listData

  if (filters.eventoId) {
    filtered = filtered.filter((item) => item.eventoId === filters.eventoId)
  }

  if (filters.search) {
    const term = filters.search.toLowerCase()
    filtered = filtered.filter((item) => {
      const nombre = (item.nombre || '').toLowerCase()
      const numeroEdicion = String(item.numeroEdicion)
      return nombre.includes(term) || numeroEdicion.includes(term)
    })
  }

  const sorted = [...filtered].sort((a, b) => {
    if (!a.firstDate && !b.firstDate) return 0
    if (!a.firstDate) return -1
    if (!b.firstDate) return 1
    return b.firstDate.localeCompare(a.firstDate)
  })

  const start = (page - 1) * pageSize
  const paginatedEdiciones = sorted.slice(start, start + pageSize)

  return { paginatedEdiciones, totalFilteredItems: sorted.length }
}

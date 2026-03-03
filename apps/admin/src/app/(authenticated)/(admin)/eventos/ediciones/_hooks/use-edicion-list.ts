import { useMemo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEdicionProjectionStore } from '../_store/edicion-ui-store'
import { useEdicionDiaProjectionStore } from '../_store/edicion-dia-ui-store'
import { useEventoProjectionStore } from '../../_store/evento-ui-store'
import { useEdicionFilterStore } from '../_store/edicion-filter-store'
import { useEdicionPaginationStore } from '../_store/edicion-pagination-store'

export function useEdicionList(): {
  paginatedIds: string[]
  totalFilteredItems: number
} {
  const filters = useEdicionFilterStore((s) => s.filters)
  const page = useEdicionPaginationStore((s) => s.page)
  const pageSize = useEdicionPaginationStore((s) => s.pageSize)

  const { allIds, byId: edicionById } = useEdicionProjectionStore(
    useShallow((s) => ({ allIds: s.allIds, byId: s.byId }))
  )
  const diasById = useEdicionDiaProjectionStore((s) => s.byId)
  const eventoById = useEventoProjectionStore((s) => s.byId)

  const listData = useMemo(() => {
    return allIds.map((id) => {
      const edicion = edicionById[id]
      const evento = eventoById[edicion.eventoId]

      const dias = Object.values(diasById).filter(
        (dia) => dia.eventoEdicionId === edicion.id
      )
      const sortedDias = dias.sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      )

      let dateRange = ''
      if (sortedDias.length > 0) {
        const firstDate = new Date(sortedDias[0].fecha)
        const lastDate = new Date(sortedDias[sortedDias.length - 1].fecha)
        const firstFormatted = firstDate.toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short'
        })
        const lastFormatted = lastDate.toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
        dateRange = `${firstFormatted} - ${lastFormatted}`
      }

      return {
        id: edicion.id,
        eventoId: edicion.eventoId,
        numeroEdicion: edicion.numeroEdicion,
        nombre: edicion.nombre ?? '',
        eventoNombre: evento?.nombre ?? '',
        dateRange
      }
    })
  }, [allIds, edicionById, eventoById, diasById])

  const filteredAndSortedIds = useMemo(() => {
    let filtered = listData

    if (filters.eventoId) {
      filtered = filtered.filter((item) => item.eventoId === filters.eventoId)
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter((item) => {
        const nombre = (item.nombre || '').toLowerCase()
        const numeroEdicion = item.numeroEdicion.toString()
        return nombre.includes(term) || numeroEdicion.includes(term)
      })
    }

    filtered.sort((a, b) => {
      const eventoCompare = a.eventoNombre.localeCompare(b.eventoNombre)
      if (eventoCompare !== 0) return eventoCompare
      return a.numeroEdicion.localeCompare(b.numeroEdicion)
    })

    return filtered.map((i) => i.id)
  }, [listData, filters])

  useEffect(() => {
    useEdicionPaginationStore
      .getState()
      .setTotalItems(filteredAndSortedIds.length)
  }, [filteredAndSortedIds.length])

  const paginatedIds = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedIds.slice(start, start + pageSize)
  }, [filteredAndSortedIds, page, pageSize])

  return { paginatedIds, totalFilteredItems: filteredAndSortedIds.length }
}

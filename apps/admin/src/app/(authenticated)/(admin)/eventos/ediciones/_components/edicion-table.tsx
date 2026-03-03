'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import { useEdicionList } from '../_hooks/use-edicion-list'
import { useEdicionFilterStore } from '../_store/edicion-filter-store'
import { EdicionRow } from './edicion-row'

export function EdicionTable() {
  const { paginatedIds } = useEdicionList()
  const setFilters = useEdicionFilterStore((s) => s.setFilters)

  if (paginatedIds.length === 0) {
    return (
      <EmptyState
        title='Sin ediciones'
        description='No hay ediciones que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: () => {
            setFilters({
              eventoId: null,
              search: ''
            })
          }
        }}
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-12'></TableHead>
          <TableHead>Evento</TableHead>
          <TableHead className='w-24'>Número</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Fechas</TableHead>
          <TableHead>Lugar</TableHead>
          <TableHead className='w-32'>Modalidad</TableHead>
          <TableHead className='w-24'></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedIds.map((id) => (
          <EdicionRow key={id} id={id} />
        ))}
      </TableBody>
    </Table>
  )
}

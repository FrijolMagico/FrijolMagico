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
    <div className='overflow-hidden rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/50'>
            <TableHead className='w-14'></TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Lugar</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead className='w-26' />
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedIds.map((id) => (
            <EdicionRow key={id} id={id} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

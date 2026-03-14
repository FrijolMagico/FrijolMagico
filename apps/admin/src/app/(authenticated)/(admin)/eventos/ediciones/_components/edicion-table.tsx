'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import { useEdicionFilterStore } from '../_store/edicion-filter-store'
import { EdicionRow } from './edicion-row'
import type { EdicionDiaEntry, LugarEntry } from '../_types'
import type { EventoEntry } from '../../_types'
import type { PaginatedEdicion } from '../_hooks/use-edicion-list'

interface EdicionTableProps {
  ediciones: PaginatedEdicion[]
  dias: EdicionDiaEntry[]
  lugares: LugarEntry[]
  eventos: EventoEntry[]
}

export function EdicionTable({
  ediciones,
  dias,
  lugares,
  eventos
}: EdicionTableProps) {
  const setFilters = useEdicionFilterStore((s) => s.setFilters)

  if (ediciones.length === 0) {
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
          {ediciones.map((edicion) => (
            <EdicionRow
              key={edicion.id}
              edicion={edicion}
              dias={dias.filter((d) => d.eventoEdicionId === edicion.id)}
              lugares={lugares}
              eventos={eventos}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

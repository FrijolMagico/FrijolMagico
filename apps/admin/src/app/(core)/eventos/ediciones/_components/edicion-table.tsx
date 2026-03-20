'use client'

import { EmptyState } from '@/shared/components/empty-state'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import type { EditionDay, Place } from '../_schemas/edicion.schema'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { EdicionRow } from './edicion-row'

interface EdicionTableProps {
  ediciones: PaginatedEdition[]
  dias: EditionDay[]
  lugares: Place[]
  eventos: EventoLookup[]
  onClearFilters: () => void
}

export function EdicionTable({
  ediciones,
  dias,
  lugares,
  eventos,
  onClearFilters
}: EdicionTableProps) {
  if (ediciones.length === 0) {
    return (
      <EmptyState
        title='Sin ediciones'
        description='No hay ediciones que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: onClearFilters
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
              dias={dias.filter((dia) => dia.eventoEdicionId === edicion.id)}
              lugares={lugares}
              eventos={eventos}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

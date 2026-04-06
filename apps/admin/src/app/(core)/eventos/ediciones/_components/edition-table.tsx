'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import type { EditionDay } from '../_schemas/edition-day.schema'
import type { Place } from '../_schemas/place.schema'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { EditionRow } from './edition-row'

interface EditionTableProps {
  editions: PaginatedEdition[]
  days: EditionDay[]
  places: Place[]
  events: EventoLookup[]
}

export function EditionTable({
  editions,
  days,
  places,
  events
}: EditionTableProps) {
  return (
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
        {editions.map((edicion) => (
          <EditionRow
            key={edicion.id}
            edition={edicion}
            days={days.filter((dia) => dia.eventoEdicionId === edicion.id)}
            places={places}
            events={events}
          />
        ))}
      </TableBody>
    </Table>
  )
}

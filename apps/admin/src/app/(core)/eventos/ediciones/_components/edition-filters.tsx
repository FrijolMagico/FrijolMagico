'use client'

import { IconSearch, IconX } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import type { EventoLookup } from '../_types'
import { EditionsQueryParams } from '../_schemas/query-params.schema'

interface EditionsFiltersProps {
  events: EventoLookup[]
  filters: EditionsQueryParams
  setFilters: (filters: Partial<EditionsQueryParams>) => void
}

export function EditionsFilters({
  events,
  filters,
  setFilters
}: EditionsFiltersProps) {
  const editionFilterOptions: Record<string, string> = {
    all: 'Todos los eventos',
    ...events.reduce<Record<string, string>>((accumulator, evento) => {
      accumulator[String(evento.id)] = evento.nombre
      return accumulator
    }, {})
  }

  const handleSearchChange = (value: string) => {
    setFilters({
      page: 1,
      search: value
    })
  }

  const handleEventoChange = (value: string | null) => {
    if (!value) return
    const eventId = value === 'all' ? null : Number(value)
    setFilters({
      page: 1,
      evento: eventId
    })
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      evento: null
    })
  }

  const hasActiveFilters = filters.evento !== null || filters.search !== ''

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <div className='relative max-w-sm flex-1'>
        <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          key={filters.search}
          placeholder='Buscar edición...'
          defaultValue={filters.search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className='pl-9'
        />
      </div>

      <div className='flex items-center gap-2'>
        <Select
          value={filters.evento === null ? 'all' : String(filters.evento)}
          onValueChange={handleEventoChange}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Todos los eventos'>
              {
                editionFilterOptions[
                  filters.evento === null ? 'all' : String(filters.evento)
                ]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los eventos</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={String(event.id)}>
                {event.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters}>
            <IconX className='mr-1 h-4 w-4' />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}

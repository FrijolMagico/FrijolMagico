'use client'

import { IconSearch, IconX } from '@tabler/icons-react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import type { EventoEntry } from '../../_types'

interface EdicionFiltersValue {
  eventoId: string | null
  search: string
}

interface EdicionFiltersProps {
  eventos: EventoEntry[]
  filters: EdicionFiltersValue
  onSearchChange: (search: string) => void
  onEventoChange: (eventoId: string | null) => void
  onClearFilters: () => void
}

export function EdicionFilters({
  eventos,
  filters,
  onSearchChange,
  onEventoChange,
  onClearFilters
}: EdicionFiltersProps) {
  const EDITION_FILTERS_OPTIONS: Record<string, string> = {
    all: 'Todos los eventos',
    ...eventos.reduce(
      (acc, evento) => {
        acc[evento.id] = evento.nombre
        return acc
      },
      {} as Record<string, string>
    )
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value)
  }, 300)

  const handleSearchChange = (value: string) => {
    debouncedSearch(value)
  }

  const handleEventoChange = (value: string | null) => {
    if (!value) return
    onEventoChange(value === 'all' ? null : value)
  }

  const hasActiveFilters = filters.eventoId !== null || filters.search !== ''

  const clearFilters = () => {
    debouncedSearch.cancel()
    onClearFilters()
  }

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <div className='relative max-w-sm flex-1'>
        <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          key={filters.search}
          placeholder='Buscar edición...'
          defaultValue={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className='pl-9'
        />
      </div>

      <div className='flex items-center gap-2'>
        <Select
          value={filters.eventoId ?? 'all'}
          onValueChange={handleEventoChange}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Todos los eventos'>
              {EDITION_FILTERS_OPTIONS[filters.eventoId ?? 'all']}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los eventos</SelectItem>
            {eventos.map((evento) => (
              <SelectItem key={evento.id} value={evento.id}>
                {evento.nombre}
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

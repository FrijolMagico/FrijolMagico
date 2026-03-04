'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
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
import { useEdicionFilterStore } from '../_store/edicion-filter-store'
import { useEventoProjectionStore } from '../../_store/evento-ui-store'

export function EdicionFilters() {
  const filters = useEdicionFilterStore((s) => s.filters)
  const setFilter = useEdicionFilterStore((s) => s.setFilter)
  const setFilters = useEdicionFilterStore((s) => s.setFilters)

  const eventoIds = useEventoProjectionStore((s) => s.allIds)
  const eventoById = useEventoProjectionStore((s) => s.byId)

  const EDITION_FILTERS_OPTIONS: Record<string, string> = {
    all: 'Todos los eventos',
    ...eventoIds.reduce(
      (acc, id) => {
        acc[id] = eventoById[id]?.nombre ?? id
        return acc
      },
      {} as Record<string, string>
    )
  }

  const [localSearch, setLocalSearch] = useState(filters.search)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setFilter('search', value)
  }, 300)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    debouncedSearch(value)
  }

  const handleEventoChange = (value: string | null) => {
    if (!value) return
    setFilter('eventoId', value === 'all' ? null : value)
  }

  const hasActiveFilters = filters.eventoId !== null || filters.search !== ''

  const clearFilters = () => {
    setLocalSearch('')
    debouncedSearch.cancel()
    setFilters({ eventoId: null, search: '' })
  }

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <div className='relative max-w-sm flex-1'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='Buscar edición...'
          value={localSearch}
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
            {eventoIds.map((id) => (
              <SelectItem key={id} value={id}>
                {eventoById[id]?.nombre ?? id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters}>
            <X className='mr-1 h-4 w-4' />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}

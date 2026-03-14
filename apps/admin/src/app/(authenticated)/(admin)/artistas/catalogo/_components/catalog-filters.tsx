'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { IconSearch, IconX } from '@tabler/icons-react'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'

export function CatalogFilters() {
  const filters = useCatalogFilterStore((state) => state.filters)
  const setFilter = useCatalogFilterStore((state) => state.setFilter)

  // Local state for the search input — decoupled from the global store
  // to prevent the URL→store sync race condition from overwriting keystrokes
  const [localSearch, setLocalSearch] = useState(filters.search)
  const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
    setFilter('search', value)
  }, 300)

  const hasActiveFilters =
    filters.activo !== null ||
    filters.destacado !== null ||
    filters.search !== ''

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    debouncedSearchUpdate(value)
  }

  const handleActivoChange = (value: string | null) => {
    if (!value) return
    const activo = value === 'all' ? null : value === 'true'
    setFilter('activo', activo)
  }

  const handleDestacadoChange = (value: string | null) => {
    if (!value) return
    const destacado = value === 'all' ? null : value === 'true'
    setFilter('destacado', destacado)
  }

  const clearFilters = () => {
    setLocalSearch('')
    debouncedSearchUpdate.cancel()
    const filterStore = useCatalogFilterStore.getState()
    filterStore.setFilters({ activo: null, destacado: null, search: '' })
  }

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-1 items-center gap-2'>
        <div className='relative max-w-sm flex-1'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Buscar artista...'
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Select
          value={filters.activo === null ? 'all' : String(filters.activo)}
          onValueChange={handleActivoChange}
        >
          <SelectTrigger className='w-35'>
            <SelectValue placeholder='Estado' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos</SelectItem>
            <SelectItem value='true'>Activos</SelectItem>
            <SelectItem value='false'>Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.destacado === null ? 'all' : String(filters.destacado)}
          onValueChange={handleDestacadoChange}
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Destacado' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos</SelectItem>
            <SelectItem value='true'>Destacados</SelectItem>
            <SelectItem value='false'>No destacados</SelectItem>
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

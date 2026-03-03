'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Search, X } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'

interface ArtistListFiltersProps {
  countries: string[]
  cities: string[]
  onFiltersChange: (filters: {
    search?: string
    country?: string | null
    city?: string | null
    statusId?: number | null
  }) => void
}

export function ArtistListFilters({
  countries,
  cities,
  onFiltersChange
}: ArtistListFiltersProps) {
  const filters = useArtistListFilterStore((s) => s.filters)
  const setFilter = useArtistListFilterStore((s) => s.setFilter)
  const setFilters = useArtistListFilterStore((s) => s.setFilters)

  // Local state for the search input — decoupled from the global store
  // to prevent the URL→store sync race condition from overwriting keystrokes
  const [localSearch, setLocalSearch] = useState(filters.search)

  const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
    setFilter('search', value)
    onFiltersChange({
      search: value,
      country: filters.country,
      city: filters.city,
      statusId: filters.statusId
    })
  }, 300)

  const hasActiveFilters =
    filters.search !== '' ||
    filters.country !== null ||
    filters.city !== null ||
    filters.statusId !== null

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    debouncedSearchUpdate(value)
  }

  const handleCountryChange = (value: string | null) => {
    if (!value) return
    const country = value === 'all' ? null : value
    setFilter('country', country)
    onFiltersChange({
      // Use localSearch to avoid passing a stale store value when the user
      // has typed ahead of the debounce window
      search: localSearch,
      country,
      city: filters.city,
      statusId: filters.statusId
    })
  }

  const handleCityChange = (value: string | null) => {
    if (!value) return
    const city = value === 'all' ? null : value
    setFilter('city', city)
    onFiltersChange({
      search: localSearch,
      country: filters.country,
      city,
      statusId: filters.statusId
    })
  }

  const handleStatusChange = (value: string | null) => {
    if (!value) return
    const statusId = value === 'all' ? null : Number(value)
    setFilter('statusId', statusId)
    onFiltersChange({
      search: localSearch,
      country: filters.country,
      city: filters.city,
      statusId
    })
  }

  const clearFilters = () => {
    setLocalSearch('')
    debouncedSearchUpdate.cancel()
    setFilters({ search: '', country: null, city: null, statusId: null })
    onFiltersChange({ search: '', country: null, city: null, statusId: null })
  }

  return (
    <div className='flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-xs flex-1 items-center gap-2'>
        <div className='relative max-w-sm flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Buscar por nombre o pseudónimo...'
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Select
          value={filters.statusId ? String(filters.statusId) : 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder='Estado'>
              {filters.statusId === 2
                ? 'Activo'
                : filters.statusId === 3
                  ? 'Inactivo'
                  : filters.statusId === 4
                    ? 'Vetado'
                    : filters.statusId === 5
                      ? 'Cancelado'
                      : filters.statusId === 1
                        ? 'Desconocido'
                        : 'Todos los estados'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los estados</SelectItem>
            <SelectItem value='2'>Activo</SelectItem>
            <SelectItem value='3'>Inactivo</SelectItem>
            <SelectItem value='4'>Vetado</SelectItem>
            <SelectItem value='5'>Cancelado</SelectItem>
            <SelectItem value='1'>Desconocido</SelectItem>
          </SelectContent>
        </Select>

        {countries.length > 0 && (
          <Select
            value={filters.country ?? 'all'}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder='País'>
                {filters.country ?? 'Todos los países'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los países</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {cities.length > 0 && (
          <Select
            value={filters.city ?? 'all'}
            onValueChange={handleCityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder='Ciudad'>
                {filters.city ?? 'Todas las ciudades'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas las ciudades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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

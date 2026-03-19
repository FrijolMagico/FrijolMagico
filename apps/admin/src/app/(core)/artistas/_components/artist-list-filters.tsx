'use client'

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
import { ARTIST_STATUS, STATUS_LABEL_MAP } from '../_constants'

interface ArtistListFiltersValue {
  search: string
  country: string | null
  city: string | null
  statusId: number | null
}

interface ArtistListFiltersProps {
  countries: string[]
  cities: string[]
  filters: ArtistListFiltersValue
  onSearchChange: (search: string) => void
  onCountryChange: (country: string | null) => void
  onCityChange: (city: string | null) => void
  onStatusChange: (statusId: number | null) => void
  onClearFilters: () => void
}

export function ArtistListFilters({
  countries,
  cities,
  filters,
  onSearchChange,
  onCountryChange,
  onCityChange,
  onStatusChange,
  onClearFilters
}: ArtistListFiltersProps) {
  const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
    onSearchChange(value)
  }, 300)

  const hasActiveFilters =
    filters.search !== '' ||
    filters.country !== null ||
    filters.city !== null ||
    filters.statusId !== null

  const handleSearchChange = (value: string) => {
    debouncedSearchUpdate(value)
  }

  const handleCountryChange = (value: string | null) => {
    if (!value) return
    const country = value === 'all' ? null : value
    onCountryChange(country)
  }

  const handleCityChange = (value: string | null) => {
    if (!value) return
    const city = value === 'all' ? null : value
    onCityChange(city)
  }

  const handleStatusChange = (value: string | null) => {
    if (!value) return
    const statusId = value === 'all' ? null : Number(value)
    onStatusChange(statusId)
  }

  const clearFilters = () => {
    debouncedSearchUpdate.cancel()
    onClearFilters()
  }

  return (
    <div className='flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-xs flex-1 items-center gap-2'>
        <div className='relative max-w-sm flex-1'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            key={filters.search}
            placeholder='Buscar por nombre o pseudónimo...'
            defaultValue={filters.search}
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
              {STATUS_LABEL_MAP[filters.statusId as ARTIST_STATUS]}{' '}
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
            <IconX className='mr-1 h-4 w-4' />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}

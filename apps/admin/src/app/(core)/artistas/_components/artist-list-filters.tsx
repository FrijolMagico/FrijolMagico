'use client'

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
import { ArtistQueryParams } from '../_schemas/query-params.schema'

interface ArtistListFiltersProps {
  countries: string[]
  cities: string[]
  setFilters: (filters: Partial<ArtistQueryParams>) => void
  filters: ArtistQueryParams
}

export function ArtistListFilters({
  countries,
  cities,
  filters,
  setFilters
}: ArtistListFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.pais !== null ||
    filters.ciudad !== null ||
    filters.estado !== null

  const handleSearchChange = (value: string) => {
    setFilters({ page: 1, search: value })
  }

  const handleCountryChange = (value: string | null) => {
    if (!value) return
    const country = value === 'all' ? null : value
    setFilters({ page: 1, pais: country })
  }

  const handleCityChange = (value: string | null) => {
    if (!value) return
    const ciudad = value === 'all' ? null : value
    setFilters({ page: 1, ciudad: ciudad })
  }

  const handleStatusChange = (value: string | null) => {
    if (!value) return
    const estado = value === '0' ? null : Number(value)
    setFilters({ page: 1, estado })
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      pais: null,
      ciudad: null,
      estado: null
    })
  }

  return (
    <div className='flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-xs flex-1 items-center gap-2'>
        <div className='relative max-w-sm flex-1'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Buscar por nombre o pseudónimo...'
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Select
          value={filters.estado ? String(filters.estado) : '0'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder='Estado'>
              {STATUS_LABEL_MAP[filters.estado as ARTIST_STATUS] ?? 'Todos'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Todos los estados</SelectItem>
            <SelectItem value='2'>Activo</SelectItem>
            <SelectItem value='3'>Inactivo</SelectItem>
            <SelectItem value='4'>Vetado</SelectItem>
            <SelectItem value='5'>Cancelado</SelectItem>
            <SelectItem value='1'>Desconocido</SelectItem>
          </SelectContent>
        </Select>

        {countries.length > 0 && (
          <Select
            value={filters.pais ?? 'all'}
            onValueChange={handleCountryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder='País'>
                {filters.pais ?? 'Todos los países'}
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
            value={filters.ciudad ?? 'all'}
            onValueChange={handleCityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder='Ciudad'>
                {filters.ciudad ?? 'Todas las ciudades'}
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

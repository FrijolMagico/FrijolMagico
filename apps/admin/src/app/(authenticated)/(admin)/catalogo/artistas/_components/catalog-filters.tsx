'use client'

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
import { useCatalogView } from '../_hooks/use-catalog-view'

interface CatalogFiltersProps {
  onFiltersChange: (filters: {
    activo?: boolean
    destacado?: boolean
    search?: string
  }) => void
}

export function CatalogFilters({ onFiltersChange }: CatalogFiltersProps) {
  const { filters, setFilters } = useCatalogView()

  const hasActiveFilters =
    filters.activo !== null ||
    filters.destacado !== null ||
    filters.search !== ''

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
    onFiltersChange({
      activo: filters.activo ?? undefined,
      destacado: filters.destacado ?? undefined,
      search: value
    })
  }

  const handleActivoChange = (value: string | null) => {
    const activo = value === 'all' ? null : value === 'true' ? true : false
    setFilters({ activo })
    onFiltersChange({
      activo: activo ?? undefined,
      destacado: filters.destacado ?? undefined,
      search: filters.search
    })
  }

  const handleDestacadoChange = (value: string | null) => {
    const destacado = value === 'all' ? null : value === 'true' ? true : false
    setFilters({ destacado })
    onFiltersChange({
      activo: filters.activo ?? undefined,
      destacado: destacado ?? undefined,
      search: filters.search
    })
  }

  const clearFilters = () => {
    setFilters({ activo: null, destacado: null, search: '' })
    onFiltersChange({})
  }

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-1 items-center gap-2'>
        <div className='relative max-w-sm flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Buscar artista...'
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Select
          value={filters.activo === null ? 'all' : filters.activo.toString()}
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
          value={
            filters.destacado === null ? 'all' : filters.destacado.toString()
          }
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
          <Button
            variant='ghost'
            size='sm'
            onClick={clearFilters}
            className='ml-2'
            title='Limpiar filtros'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}

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
import { useCatalogViewStore } from '../_store/catalog-view-store'

interface CatalogFiltersProps {
  onFiltersChange: (filters: {
    activo?: boolean | null
    destacado?: boolean | null
    search?: string
  }) => void
}

export function CatalogFilters({ onFiltersChange }: CatalogFiltersProps) {
  const filters = useCatalogViewStore((state) => state.filters)
  const setFilters = useCatalogViewStore((state) => state.setFilters)

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
    if (!value) return
    const activo = value === 'all' ? null : value === 'true'
    setFilters({ activo })
    onFiltersChange({
      activo: activo,
      destacado: filters.destacado,
      search: filters.search
    })
  }

  const handleDestacadoChange = (value: string | null) => {
    if (!value) return
    const destacado = value === 'all' ? null : value === 'true'
    setFilters({ destacado })
    onFiltersChange({
      activo: filters.activo,
      destacado: destacado,
      search: filters.search
    })
  }

  const clearFilters = () => {
    setFilters({ activo: null, destacado: null, search: '' })
    // Fix: Pass explicit nulls so the parent knows to remove params
    onFiltersChange({ activo: null, destacado: null, search: '' })
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
          value={
            filters.activo === null
              ? 'Todos'
              : filters.activo
                ? 'Activo'
                : 'Inactivo'
          }
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
            filters.destacado === null
              ? 'Todos'
              : filters.destacado
                ? 'Destacados'
                : 'No destacados'
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
          <Button variant='ghost' size='sm' onClick={clearFilters}>
            <X className='mr-1 h-4 w-4' />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}

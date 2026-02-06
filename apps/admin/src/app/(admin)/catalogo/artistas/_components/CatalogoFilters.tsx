'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCatalogoForm } from '../_hooks/useCatalogoForm'

interface CatalogoFiltersProps {
  onFiltersChange: (filters: {
    activo?: boolean
    destacado?: boolean
    search?: string
  }) => void
}

export function CatalogoFilters({ onFiltersChange }: CatalogoFiltersProps) {
  const filters = useCatalogoForm((state) => state.filters)
  const setFilters = useCatalogoForm((state) => state.setFilters)

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

  const handleActivoChange = (value: string) => {
    const activo = value === 'all' ? null : value === 'true'
    setFilters({ activo })
    onFiltersChange({
      activo: activo ?? undefined,
      destacado: filters.destacado ?? undefined,
      search: filters.search
    })
  }

  const handleDestacadoChange = (value: string) => {
    const destacado = value === 'all' ? null : value === 'true'
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar artista..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.activo === null ? 'all' : filters.activo.toString()}
          onValueChange={handleActivoChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.destacado === null ? 'all' : filters.destacado.toString()
          }
          onValueChange={handleDestacadoChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Destacado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Destacados</SelectItem>
            <SelectItem value="false">No destacados</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}

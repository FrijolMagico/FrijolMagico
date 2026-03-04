'use client'

import { memo } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import { useArtistList } from '../_hooks/use-artist-list'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { ArtistListRow } from './artist-list-row'

interface ArtistListTableProps {
  onClearFilters: () => void
  artistIdsWithHistory: Set<string>
}

export const ArtistListTable = memo(function ArtistListTable({
  onClearFilters,
  artistIdsWithHistory
}: ArtistListTableProps) {
  const { paginatedIds } = useArtistList()
  const setFilters = useArtistListFilterStore((s) => s.setFilters)

  if (paginatedIds.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: () => {
            setFilters({
              search: '',
              country: null,
              city: null,
              statusId: null
            })
            onClearFilters()
          }
        }}
      />
    )
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-26'></TableHead>
            <TableHead>Pseudónimo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>RUT</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedIds.map((id) => (
            <ArtistListRow
              key={id}
              id={id}
              hasHistory={artistIdsWithHistory.has(id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

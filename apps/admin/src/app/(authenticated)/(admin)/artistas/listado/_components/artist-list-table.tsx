'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import { useArtistList } from '../_hooks/use-artist-list'
import { useHistoryByArtist } from '../_hooks/use-history-by-artist'
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { ArtistListRow } from './artist-list-row'

interface ArtistListTableProps {
  onClearFilters: () => void
}

export function ArtistListTable({ onClearFilters }: ArtistListTableProps) {
  const { paginatedIds } = useArtistList()
  const { artistIdsWithHistory } = useHistoryByArtist()
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pseudónimo</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>RUT</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className='w-24'></TableHead>
          <TableHead></TableHead>
          <TableHead></TableHead>
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
  )
}

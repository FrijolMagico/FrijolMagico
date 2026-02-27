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
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { ArtistListRow } from './artist-list-row'
import type { HistoryEntry } from '../_types'

interface ArtistListTableProps {
  onClearFilters: () => void
  artistIdsWithHistory: Set<string>
  historyByArtistId: Map<string, HistoryEntry[]>
}

export function ArtistListTable({
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

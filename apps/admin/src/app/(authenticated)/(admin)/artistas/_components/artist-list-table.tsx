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
import { useArtistListFilterStore } from '../_store/artist-list-filter-store'
import { ArtistListRow } from './artist-list-row'
import { DomainArtist } from '../_types/artist'

interface ArtistListTableProps {
  artists: DomainArtist[]
  onClearFilters: () => void
}

export const ArtistListTable = memo(function ArtistListTable({
  artists,
  onClearFilters
}: ArtistListTableProps) {
  const setFilters = useArtistListFilterStore((s) => s.setFilters)

  if (artists.length === 0) {
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
            <TableHead>Pseudónimo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>RRSS</TableHead>
            <TableHead>RUT</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artists.map((artist) => (
            <ArtistListRow key={artist.id} artist={artist} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

'use client'

import type { ReactNode } from 'react'

import { DeletedListTable } from '@/shared/components/deleted-toggle-list'
import { TableHead, TableRow } from '@/shared/components/ui/table'
import type { ArtistWithHistory } from '../_types/artist'
import { ArtistListRow } from './artist-list-row'

interface ArtistListTableProps {
  artists: ArtistWithHistory[]
  showDeleted: boolean
  handleDelete: (id: number) => void
  handleRestore: (id: number) => void
  emptyState?: ReactNode
  isPending?: boolean
}

export function ArtistListTable({
  artists,
  showDeleted,
  handleDelete,
  handleRestore,
  emptyState,
  isPending = false
}: ArtistListTableProps) {
  return (
    <DeletedListTable
      items={artists}
      getId={(artist) => artist.id}
      onDelete={handleDelete}
      onRestore={handleRestore}
      isDeletedView={showDeleted}
      emptyState={emptyState}
      columns={
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
      }
      renderRow={(artist, context) => (
        <ArtistListRow
          key={artist.id}
          artist={artist}
          isDeletedView={context.isDeletedView}
          onDelete={context.onDelete}
          onRestore={context.onRestore}
          isPending={isPending}
        />
      )}
    />
  )
}

'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/empty-state'
import type { ArtistWithHistory } from '../_types/artist'
import { ArtistListRow } from './artist-list-row'
import { startTransition, useOptimistic } from 'react'
import { deleteArtistaAction } from '../_actions/delete-artista.action'
import { toast } from 'sonner'

interface ArtistListTableProps {
  artists: ArtistWithHistory[]
  onClearFilters: () => void
}

export function ArtistListTable({
  artists,
  onClearFilters
}: ArtistListTableProps) {
  const [optimisticArtists, setOptimisticArtists] = useOptimistic(
    artists,
    (current, id: number) => current.filter((curr) => curr.id !== id)
  )

  if (artists.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: onClearFilters
        }}
      />
    )
  }

  const handleArtistsDelete = (id: number) => {
    startTransition(async () => {
      setOptimisticArtists(id)
      try {
        const result = await deleteArtistaAction(id)
        if (result.success) toast.success('Artista eliminado exitósamente c:')
      } catch (error) {
        toast.error('Ocurrió un problema al intentar eliminar al artista')
        console.error(error)
      }
    })
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
            <ArtistListRow
              key={artist.id}
              artist={artist}
              onDelete={handleArtistsDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import type { ArtistWithHistory } from '../_types/artist'
import { ArtistListRow } from './artist-list-row'
import { startTransition, useOptimistic } from 'react'
import { deleteArtistaAction } from '../_actions/delete-artista.action'
import { toast } from 'sonner'

interface ArtistListTableProps {
  artists: ArtistWithHistory[]
}

export function ArtistListTable({ artists }: ArtistListTableProps) {
  const [displayArtists, setOptimisticArtists] = useOptimistic(
    artists,
    (current, id: number) => current.filter((curr) => curr.id !== id)
  )

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
        {displayArtists.map((artist) => (
          <ArtistListRow
            key={artist.id}
            artist={artist}
            onDelete={handleArtistsDelete}
          />
        ))}
      </TableBody>
    </Table>
  )
}

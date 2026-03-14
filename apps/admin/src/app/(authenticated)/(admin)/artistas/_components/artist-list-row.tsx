'use client'

import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { RRSSViewer } from '@/shared/components/rrss/rrss-viewer'
import { deleteArtistaAction } from '../_actions/delete-artista.action'
import { DomainArtist } from '../_types/artist'
import { STATUS_LABEL_MAP } from '../_constants'
import { toast } from 'sonner'

interface ArtistListRowProps {
  artist: DomainArtist
}

export function ArtistListRow({ artist }: ArtistListRowProps) {
  const { history, ...artistData } = artist

  const openUpdateArtistDialog = useArtistDialog(
    (s) => s.openUpdateArtistDialog
  )
  const openArtistHistoryDialog = useArtistDialog(
    (s) => s.openArtistHistoryDialog
  )

  const handleOpenHistory = () =>
    openArtistHistoryDialog(history, { pseudonimo: artistData.pseudonimo })

  const handleOpenEdit = () => openUpdateArtistDialog(artistData)

  const handleDelete = async () => {
    const result = await deleteArtistaAction(artist.id)

    if (!result.success) {
      toast.error(
        result.errors
          ? result.errors.map((e) => e.message).join(', ')
          : 'Error al eliminar al Artista'
      )
      return
    }

    toast.success('Artista eliminado correctamente')
  }

  return (
    <TableRow className={cn('group')}>
      <TableCell className='font-medium'>{artist.pseudonimo}</TableCell>
      <TableCell>{artist.nombre || '-'}</TableCell>
      <TableCell>{artist.correo || '-'}</TableCell>
      <TableCell>
        {[artist.ciudad, artist.pais].filter(Boolean).join(', ') || '-'}
      </TableCell>
      <TableCell>
        <RRSSViewer rrss={artist.rrss} />
      </TableCell>
      <TableCell className='text-muted-foreground'>
        {artist.rut || '-'}
      </TableCell>
      <TableCell>
        <Badge variant='outline' className='capitalize'>
          {STATUS_LABEL_MAP[artist.estadoId]}
        </Badge>
      </TableCell>
      <TableCell>
        <ActionMenuButton
          actions={[
            {
              label: 'Editar',
              onClick: handleOpenEdit
            },
            {
              label: 'Historial',
              onClick: handleOpenHistory,
              hidden: !artist.history
            }
          ]}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  )
}

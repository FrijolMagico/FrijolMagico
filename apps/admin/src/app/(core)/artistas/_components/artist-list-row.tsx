'use client'

import { IconRotateClockwise } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { RRSSViewer } from '@/shared/components/rrss/rrss-viewer'
import type { ArtistWithHistory } from '../_types/artist'
import { STATUS_LABEL_MAP } from '../_constants'
import { CopyToClipboard } from '@/shared/components/copy-to-clipboard'

interface ArtistListRowProps {
  artist: ArtistWithHistory
  isDeletedView: boolean
  onDelete: () => void
  onRestore: () => void
  isPending?: boolean
}

export function ArtistListRow({
  artist,
  isDeletedView,
  onDelete,
  onRestore,
  isPending = false
}: ArtistListRowProps) {
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

  return (
    <TableRow className={cn('group')}>
      <TableCell className='font-medium'>{artist.pseudonimo}</TableCell>
      <TableCell>{artist.nombre || '-'}</TableCell>
      <TableCell>
        {artist.correo ? (
          <CopyToClipboard>{artist.correo}</CopyToClipboard>
        ) : (
          '-'
        )}
      </TableCell>
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
        {isDeletedView ? (
          <Button
            size='icon'
            variant='ghost'
            onClick={onRestore}
            disabled={isPending}
            className='text-green-500 hover:text-green-500/80'
            aria-label={`Restaurar artista ${artist.pseudonimo}`}
          >
            <IconRotateClockwise />
          </Button>
        ) : (
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
            onDelete={onDelete}
          />
        )}
      </TableCell>
    </TableRow>
  )
}

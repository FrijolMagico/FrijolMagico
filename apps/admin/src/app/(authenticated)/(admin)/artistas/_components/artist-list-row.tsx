'use client'

import { memo, useCallback } from 'react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  useArtistsOperationStore,
  useArtistsProjectionStore
} from '../_store/artista-ui-store'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { StateBadge } from '@/shared/components/state-badge'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { RRSSViewer } from '@/shared/components/rrss-viewer/rrss-viewer'

interface ArtistListRowProps {
  id: string
  hasHistory: boolean
}

export const ArtistListRow = memo(function ArtistListRow({
  id,
  hasHistory
}: ArtistListRowProps) {
  const remove = useArtistsOperationStore((s) => s.remove)
  const restore = useArtistsOperationStore((s) => s.restore)
  const artist = useArtistsProjectionStore((s) => s.byId[id])
  const openEditDialog = useArtistDialog((s) => s.openEditDialog)
  const openHistoryDialog = useArtistDialog((s) => s.openHistoryDialog)
  const isDeleted = artist?.__meta?.isDeleted ?? false

  const handleOpenHistory = useCallback(
    () => openHistoryDialog(id),
    [id, openHistoryDialog]
  )
  const handleOpenEdit = useCallback(
    () => openEditDialog(id),
    [id, openEditDialog]
  )
  const handleRemoveOrRestore = useCallback(() => {
    if (artist?.__meta?.isDeleted) {
      restore(id)
    } else {
      remove(id)
    }
  }, [id, artist, restore, remove])

  if (!artist) return null

  return (
    <TableRow
      className={cn(
        'group',
        isDeleted && 'bg-destructive/10 hover:bg-destructive/20'
      )}
    >
      <TableCell>
        <StateBadge {...artist.__meta} />
      </TableCell>
      <TableCell className='font-medium'>{artist.pseudonimo}</TableCell>
      <TableCell>{artist.nombre || '-'}</TableCell>
      <TableCell>{artist.correo || '-'}</TableCell>
      <TableCell>
        {[artist.ciudad, artist.pais].filter(Boolean).join(', ') || '-'}
      </TableCell>
      <TableCell>
        <RRSSViewer rrss={artist.rrss} disabled={isDeleted} />
      </TableCell>
      <TableCell className='text-muted-foreground'>
        {artist.rut || '-'}
      </TableCell>
      <TableCell>
        <Badge variant='outline' className='capitalize'>
          {artist.estadoSlug || 'Desconocido'}
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
              hidden: !hasHistory
            }
          ]}
          isDeleted={isDeleted}
          onDelete={handleRemoveOrRestore}
          onRestore={handleRemoveOrRestore}
        />
      </TableCell>
    </TableRow>
  )
})

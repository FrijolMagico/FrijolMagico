'use client'

import { RotateCcw, Trash2, Pencil, History } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { ButtonWithTooltip } from '@/shared/components/button-with-tooltip'
import { cn } from '@/lib/utils'
import {
  useArtistsOperationStore,
  useArtistsProjectionStore
} from '../../_store/artista-ui-store'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { StateBadge } from '@/shared/components/state-badge'

interface ArtistListRowProps {
  id: string
  hasHistory: boolean
}

export function ArtistListRow({ id, hasHistory }: ArtistListRowProps) {
  const remove = useArtistsOperationStore((s) => s.remove)
  const restore = useArtistsOperationStore((s) => s.restore)
  const artist = useArtistsProjectionStore((s) => s.byId[id])
  const openEditDialog = useArtistDialog((s) => s.openEditDialog)
  const openHistoryDialog = useArtistDialog((s) => s.openHistoryDialog)

  if (!artist) return null

  const isDeleted = artist.__meta.isDeleted

  return (
    <TableRow
      className={cn(
        'group',
        isDeleted && 'bg-destructive/10 hover:bg-destructive/20'
      )}
    >
      <TableCell className='font-medium'>{artist.pseudonimo}</TableCell>
      <TableCell>{artist.nombre || '-'}</TableCell>
      <TableCell>{artist.correo || '-'}</TableCell>
      <TableCell>
        {[artist.ciudad, artist.pais].filter(Boolean).join(', ') || '-'}
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
        <StateBadge {...artist.__meta} />
      </TableCell>
      <TableCell>
        {hasHistory && (
          <ButtonWithTooltip
            size='icon'
            variant='ghost'
            onClick={() => openHistoryDialog(id)}
            tooltipContent='Ver historial'
            className='text-muted-foreground hover:text-foreground h-8 w-8'
          >
            <History className='h-4 w-4' />
          </ButtonWithTooltip>
        )}
      </TableCell>
      <TableCell>
        <ButtonWithTooltip
          size='icon'
          variant='ghost'
          onClick={() => openEditDialog(id)}
          tooltipContent='Editar artista'
          className='h-8 w-8'
          disabled={isDeleted}
        >
          <Pencil className='h-4 w-4' />
        </ButtonWithTooltip>
      </TableCell>

      <TableCell>
        <div className='flex items-center gap-1'>
          <ButtonWithTooltip
            size='icon'
            variant='ghost'
            onClick={() => {
              if (isDeleted) {
                restore(id)
              } else {
                remove(id)
              }
            }}
            tooltipContent={isDeleted ? 'Restaurar' : 'Eliminar'}
            className={cn(
              'text-destructive hover:text-destructive/80 h-8 w-8',
              isDeleted && 'text-green-500 hover:text-green-500/80'
            )}
          >
            {isDeleted ? (
              <RotateCcw className='h-4 w-4' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
          </ButtonWithTooltip>
        </div>
      </TableCell>
    </TableRow>
  )
}

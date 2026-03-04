'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, Check, X } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Switch } from '@/shared/components/ui/switch'
import { ArtistAvatar } from './artist-avatar'
import { cn } from '@/lib/utils'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'
import { StateBadge } from '@/shared/components/state-badge'
import { ActionMenuButton } from '@/shared/components/action-menu-button'

interface CatalogRowProps {
  id: string
}

export const CatalogRow = function CatalogRow({ id }: CatalogRowProps) {
  const update = useCatalogOperationStore((s) => s.update)

  const openCatalogDialog = useCatalogViewStore((s) => s.openCatalogDialog)

  const remove = useCatalogOperationStore((s) => s.remove)
  const restore = useCatalogOperationStore((s) => s.restore)

  const catalog = useCatalogProjectionStore((s) => s.byId[id])
  const artist = useArtistsProjectionStore((s) =>
    catalog ? s.byId[catalog.artistaId] : undefined
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  if (!catalog || !artist) {
    return null
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn('group relative min-h-18.25 transition-colors', {
        'bg-accent shadow-lg': isDragging,
        'bg-destructive/10 hover:bg-destructive/20': catalog.__meta?.isDeleted
      })}
    >
      {/* Drag Handle */}
      <TableCell className='w-8'>
        <div
          {...attributes}
          {...listeners}
          className='hover:bg-muted/50 cursor-grab rounded p-1 active:cursor-grabbing'
          title='Arrastrar para reordenar'
        >
          <GripVertical className='text-muted-foreground mx-auto h-4 w-4' />
        </div>
      </TableCell>

      {/* Avatar */}
      <TableCell className='w-12'>
        <ArtistAvatar
          src={catalog.avatarUrl}
          alt={artist.pseudonimo}
          size='sm'
        />
      </TableCell>

      {/* Nombre y detalles */}
      <TableCell className='flex-1'>
        <div className='flex flex-col'>
          <span className='font-medium'>{artist.pseudonimo}</span>
          {artist.nombre && (
            <span className='text-muted-foreground text-sm'>
              {artist.nombre}
            </span>
          )}
          {(artist.ciudad || artist.pais) && (
            <span className='text-muted-foreground text-xs'>
              {[artist.ciudad, artist.pais].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <StateBadge
          isNew={artist.__meta?.isNew}
          isDeleted={artist.__meta?.isDeleted}
          isUpdated={artist.__meta?.isUpdated}
        />
      </TableCell>

      {/* Destacado */}
      <TableCell>
        <div className='flex items-center gap-2'>
          <Switch
            checked={catalog.destacado}
            onCheckedChange={(checked) => update(id, { destacado: checked })}
          />
          {catalog.destacado && (
            <Star className='fill-warning text-warning h-4 w-4' />
          )}
        </div>
      </TableCell>

      {/* Activo */}
      <TableCell>
        <div className='flex items-center gap-2'>
          <Switch
            checked={catalog.activo}
            onCheckedChange={(checked) => update(id, { activo: checked })}
          />
          {catalog.activo ? (
            <Check className='h-4 w-4 text-green-600 dark:text-green-500' />
          ) : (
            <X className='text-destructive h-4 w-4' />
          )}
        </div>
      </TableCell>

      {/* Acciones */}
      <TableCell>
        <ActionMenuButton
          actions={[
            {
              label: 'Editar',
              onClick: () => openCatalogDialog(id)
            }
          ]}
          isDeleted={catalog.__meta?.isDeleted}
          onRestore={() => restore(id)}
          onDelete={() => remove(id)}
        />
      </TableCell>
    </TableRow>
  )
}

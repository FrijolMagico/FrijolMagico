'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Star, Check, X } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Switch } from '@/shared/components/ui/switch'
import { Button } from '@/shared/components/ui/button'
import { ArtistAvatar } from './artist-avatar'
import { cn } from '@/lib/utils'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'
import { useArtistsProjectionStore } from '../../_store/artista-ui-store'

interface CatalogRowProps {
  catalogId: string
}

export function CatalogRow({ catalogId }: CatalogRowProps) {
  const isDraggingGlobal = useCatalogViewStore((s) => s.isDragging)
  const catalog = useCatalogProjectionStore((s) => s.byId[catalogId])
  const artist = useArtistsProjectionStore((s) =>
    catalog ? s.byId[catalog.artistaId] : undefined
  )
  const update = useCatalogOperationStore((s) => s.update)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: catalogId })

  if (!catalog || !artist) {
    return null
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  const handleToggleField = (field: 'destacado' | 'activo', value: boolean) => {
    update(catalogId, { [field]: value })
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn('group relative min-h-18.25', {
        'bg-accent shadow-lg': isDragging || isDraggingGlobal
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
          <GripVertical className='text-muted-foreground h-4 w-4' />
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

      {/* Orden (solo lectura) */}
      <TableCell className='w-16 text-center'>
        <div className='flex flex-col items-center'>
          <span className='text-muted-foreground font-mono text-sm'>
            {catalog.orden}
          </span>
        </div>
      </TableCell>

      {/* Destacado */}
      <TableCell className='w-24'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={catalog.destacado}
            onCheckedChange={(checked) =>
              handleToggleField('destacado', checked)
            }
          />
          {catalog.destacado && (
            <Star className='fill-warning text-warning h-4 w-4' />
          )}
        </div>
      </TableCell>

      {/* Activo */}
      <TableCell className='w-20'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={catalog.activo}
            onCheckedChange={(checked) => handleToggleField('activo', checked)}
          />
          {catalog.activo ? (
            <Check className='h-4 w-4 text-green-600 dark:text-green-500' />
          ) : (
            <X className='text-destructive h-4 w-4' />
          )}
        </div>
      </TableCell>

      {/* Acciones */}
      <TableCell className='w-32'>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() =>
              useCatalogViewStore.getState().openCatalogDialog(catalogId)
            }
            className='opacity-0 transition-opacity group-hover:opacity-100'
          >
            <Pencil className='mr-1 h-4 w-4' />
            Editar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

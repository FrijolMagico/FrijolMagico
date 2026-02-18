'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Star, Check, X } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Switch } from '@/shared/components/ui/switch'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

import { ArtistAvatar } from './artist-avatar'
import { useArtistUIStore } from '../_store/artist-ui-store'
import type { CatalogArtist } from '../_types'
import { cn } from '@/lib/utils'
import { useCatalogViewStore } from '../_store/catalog-view-store'

interface DraggableCatalogRowProps {
  artista: CatalogArtist
  onToggleField: (field: 'destacado' | 'activo', value: boolean) => void
  onEdit: () => void
}

export function DraggableCatalogRow({
  artista,
  onToggleField,
  onEdit
}: DraggableCatalogRowProps) {
  const isDraggingGlobal = useCatalogViewStore((s) => s.isDragging)

  // Check for pending changes on this specific artist
  const hasPendingChanges = useArtistUIStore(
    (state) =>
      state.currentEdits?.operations.some(
        (op) => String(op.id) === String(artista.artistaId)
      ) || false
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: artista.artistaId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn('group relative min-h-18.25', {
        'bg-accent shadow-lg': isDragging || isDraggingGlobal,
        'bg-warning/10': hasPendingChanges
      })}
    >
      {/* Drag Handle */}
      <TableCell className='w-8'>
        {hasPendingChanges && (
          <Badge
            variant='outline'
            className='border-warning/50 text-warning bg-accent absolute -top-2 -rotate-6 text-[10px]'
            about='Indica que este artista tiene cambios pendientes que no se han guardado'
          >
            Modificado
          </Badge>
        )}
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
          src={artista.avatarUrl}
          alt={artista.pseudonimo}
          size='sm'
        />
      </TableCell>

      {/* Nombre y detalles */}
      <TableCell className='flex-1'>
        <div className='flex flex-col'>
          <span className='font-medium'>{artista.pseudonimo}</span>
          {artista.nombre && (
            <span className='text-muted-foreground text-sm'>
              {artista.nombre}
            </span>
          )}
          {(artista.ciudad || artista.pais) && (
            <span className='text-muted-foreground text-xs'>
              {[artista.ciudad, artista.pais].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </TableCell>

      {/* Orden (solo lectura) */}
      <TableCell className='w-16 text-center'>
        <div className='flex flex-col items-center'>
          <span className='text-muted-foreground font-mono text-sm'>
            {artista.orden}
          </span>
        </div>
      </TableCell>

      {/* Destacado */}
      <TableCell className='w-24'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={artista.destacado}
            onCheckedChange={(checked) => onToggleField('destacado', checked)}
          />
          {artista.destacado && (
            <Star className='fill-warning text-warning h-4 w-4' />
          )}
        </div>
      </TableCell>

      {/* Activo */}
      <TableCell className='w-20'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={artista.activo}
            onCheckedChange={(checked) => onToggleField('activo', checked)}
          />
          {artista.activo ? (
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
            onClick={onEdit}
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

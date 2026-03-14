'use client'

import { useOptimistic, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconGripVertical,
  IconStar,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Switch } from '@/shared/components/ui/switch'
import { ArtistAvatar } from './artist-avatar'
import { cn } from '@/lib/utils'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { updateCatalogFieldAction } from '../_actions/update-catalog-field.action'
import { deleteCatalogAction } from '../_actions/delete-catalog.action'
import { Artist } from '../../_schemas/artista.schema'
import { useCatalogDialog } from '../_store/catalog-dialog-store'
import { Catalog } from '../_schemas/catalogo.schema'

interface CatalogRowProps {
  catalog: Catalog
  artist: Artist | undefined
}

export function CatalogRow({ catalog, artist }: CatalogRowProps) {
  const openUpdateCatalogDialog = useCatalogDialog(
    (s) => s.openUpdateCatalogDialog
  )

  const [optimisticFields, setOptimisticFields] = useOptimistic({
    activo: catalog.activo,
    destacado: catalog.destacado
  })
  const [, startTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: catalog.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  const handleToggleActivo = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticFields((prev) => ({ ...prev, activo: checked }))
      await updateCatalogFieldAction(catalog.id, { activo: checked })
    })
  }

  const handleToggleDestacado = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticFields((prev) => ({ ...prev, destacado: checked }))
      await updateCatalogFieldAction(catalog.id, { destacado: checked })
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCatalogAction(catalog.id)
    })
  }

  if (!artist) return null

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn('group relative min-h-18.25 transition-colors', {
        'bg-accent shadow-lg': isDragging
      })}
    >
      <TableCell className='w-8'>
        <div
          {...attributes}
          {...listeners}
          className='hover:bg-muted/50 cursor-grab rounded p-1 active:cursor-grabbing'
          title='Arrastrar para reordenar'
        >
          <IconGripVertical className='text-muted-foreground mx-auto h-4 w-4' />
        </div>
      </TableCell>

      <TableCell className='w-12'>
        <ArtistAvatar
          src={catalog.avatarUrl}
          alt={artist.pseudonimo}
          size='sm'
        />
      </TableCell>

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
        <div className='flex items-center gap-2'>
          <Switch
            checked={optimisticFields.destacado}
            onCheckedChange={handleToggleDestacado}
          />
          {optimisticFields.destacado && (
            <IconStar className='fill-warning text-warning h-4 w-4' />
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className='flex items-center gap-2'>
          <Switch
            checked={optimisticFields.activo}
            onCheckedChange={handleToggleActivo}
          />
          {optimisticFields.activo ? (
            <IconCheck className='h-4 w-4 text-green-600 dark:text-green-500' />
          ) : (
            <IconX className='text-destructive h-4 w-4' />
          )}
        </div>
      </TableCell>

      <TableCell>
        <ActionMenuButton
          actions={[
            {
              label: 'Editar',
              onClick: () => openUpdateCatalogDialog(catalog, artist)
            }
          ]}
          isDeleted={false}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  )
}

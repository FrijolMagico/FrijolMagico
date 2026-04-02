'use client'

import { startTransition, useOptimistic } from 'react'
import { IconStar, IconCheck, IconX } from '@tabler/icons-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Switch } from '@/shared/components/ui/switch'
import { ArtistAvatar } from './artist-avatar'
import { cn } from '@/shared/lib/utils'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { updateCatalogFieldAction } from '../_actions/update-catalog-field.action'
import { useCatalogDialog } from '../_store/catalog-dialog-store'
import type { CatalogListItem } from '../_types/catalog-list-item'
import { toast } from 'sonner'

interface CatalogRowProps {
  catalog: CatalogListItem
  sortable?: boolean
  onDelete: (id: number) => void
}

export function CatalogRow({ catalog, onDelete }: CatalogRowProps) {
  const openUpdateCatalogDialog = useCatalogDialog(
    (s) => s.openUpdateCatalogDialog
  )
  const artist = catalog.artist

  const [optimisticFields, setOptimisticFields] = useOptimistic({
    activo: catalog.activo,
    destacado: catalog.destacado
  })

  // const {
  //   attributes,
  //   listeners,
  //   setNodeRef,
  //   transform,
  //   transition,
  //   isDragging
  // } = useSortable({ id: catalog.id, disabled: !sortable })

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  //   opacity: isDragging ? 0.5 : 1,
  //   zIndex: isDragging ? 50 : 'auto'
  // }

  const handleToggleActivo = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticFields((prev) => ({ ...prev, activo: checked }))
      try {
        await updateCatalogFieldAction(catalog.id, { activo: checked })
      } catch (error) {
        toast.error('Ocurrió un error al actualizar el estado')
        console.error(error)
      }
    })
  }

  const handleToggleDestacado = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticFields((prev) => ({ ...prev, destacado: checked }))
      try {
        await updateCatalogFieldAction(catalog.id, { destacado: checked })
      } catch (error) {
        toast.error('Ocurrió un error al actualizar el estado')
        console.error(error)
      }
    })
  }

  const handleDelete = () => {
    onDelete(catalog.id)
  }

  // ref={setNodeRef}
  // style={style}
  return (
    <TableRow
      className={cn('group relative min-h-18.25 transition-colors', {
        // 'bg-accent shadow-lg': isDragging
      })}
    >
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
              onClick: () => openUpdateCatalogDialog(catalog, catalog.artist)
            }
          ]}
          isDeleted={false}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  )
}

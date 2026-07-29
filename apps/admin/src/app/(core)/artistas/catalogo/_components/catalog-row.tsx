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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'

interface CatalogRowProps {
  catalog: CatalogListItem
  sortable?: boolean
  isDeletedView?: boolean
  onDelete: () => void
  onRestore: () => void
  isPending?: boolean
}

export function CatalogRow({
  catalog,
  isDeletedView = false,
  onDelete,
  onRestore
}: CatalogRowProps) {
  const openUpdateCatalogDialog = useCatalogDialog(
    (s) => s.openUpdateCatalogDialog
  )
  const artist = catalog.artist
  const hasAvatar = catalog.activeAvatar != null

  const [optimisticFields, setOptimisticFields] = useOptimistic({
    activo: catalog.activo,
    destacado: catalog.destacado
  })

  const displayActive = hasAvatar && optimisticFields.activo

  const handleToggleActivo = (checked: boolean) => {
    if (!hasAvatar) return
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

  return (
    <TableRow
      className={cn('group relative min-h-18.25 transition-colors', {
        'opacity-60': isDeletedView
      })}
    >
      <TableCell className='w-12'>
        {hasAvatar ? (
          <ArtistAvatar
            src={catalog.activeAvatar?.path ?? null}
            alt={artist.pseudonimo}
            size='sm'
          />
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <div>
                  <ArtistAvatar
                    src={catalog.activeAvatar?.path ?? null}
                    alt={artist.pseudonimo}
                    size='sm'
                    status='missing'
                  />
                </div>
              }
            />
            <TooltipContent side='right'>
              Debe subir un avatar antes de activar la entrada
            </TooltipContent>
          </Tooltip>
        )}
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

      {isDeletedView ? (
        <TableCell>
          <span className='text-muted-foreground text-sm'>Eliminado</span>
        </TableCell>
      ) : (
        <>
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
            <div className='flex items-center gap-2' data-testid='switch-activo-cell'>
              <Switch
                checked={displayActive}
                onCheckedChange={handleToggleActivo}
                disabled={!hasAvatar}
              />
              {displayActive ? (
                <IconCheck className='h-4 w-4 text-green-600 dark:text-green-500' />
              ) : (
                <IconX className='text-destructive h-4 w-4' />
              )}
            </div>
          </TableCell>
        </>
      )}

      <TableCell>
        <ActionMenuButton
          actions={
            isDeletedView
              ? []
              : [
                  {
                    label: 'Editar',
                    onClick: () =>
                      openUpdateCatalogDialog(catalog, catalog.artist)
                  }
                ]
          }
          isDeleted={isDeletedView}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </TableCell>
    </TableRow>
  )
}

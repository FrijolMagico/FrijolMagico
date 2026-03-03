'use client'

import {
  useEventoProjectionStore,
  useEventoOperationStore
} from '../_store/evento-ui-store'
import { useEventoDialog } from '../_store/evento-dialog-store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ButtonWithTooltip } from '@/shared/components/button-with-tooltip'
import { Badge } from '@/shared/components/ui/badge'
import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventoCardProps {
  id: string
}

export function EventoCard({ id }: EventoCardProps) {
  const evento = useEventoProjectionStore((s) => s.byId[id])
  const remove = useEventoOperationStore((s) => s.remove)
  const restore = useEventoOperationStore((s) => s.restore)
  const openDialog = useEventoDialog((s) => s.openDialog)

  if (!evento) return null

  const isDeleted = evento.__meta?.isDeleted
  const isNew = evento.__meta?.isNew
  const isUpdated = evento.__meta?.isUpdated

  return (
    <Card
      className={cn(
        'flex flex-col justify-between transition-colors',
        isDeleted && 'bg-destructive/10 border-destructive/20',
        isNew && 'border-green-500/50',
        isUpdated && !isDeleted && 'border-amber-500/50'
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1.5'>
            <CardTitle
              className={cn(
                'line-clamp-1 text-lg',
                isDeleted && 'text-muted-foreground line-through'
              )}
            >
              {evento.nombre}
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='font-mono text-xs font-normal'
              >
                {evento.slug}
              </Badge>
              {isUpdated && !isDeleted && (
                <Badge
                  variant='outline'
                  className='border-amber-500 text-amber-500'
                >
                  Modificado
                </Badge>
              )}
              {isNew && !isDeleted && (
                <Badge
                  variant='outline'
                  className='border-green-500 text-green-500'
                >
                  Nuevo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            'text-muted-foreground line-clamp-2 text-sm',
            isDeleted && 'opacity-50'
          )}
        >
          {evento.descripcion || 'Sin descripción'}
        </p>
        <div className='mt-4 flex justify-end gap-2'>
          <ButtonWithTooltip
            size='icon'
            variant='ghost'
            onClick={() => openDialog(id)}
            tooltipContent='Editar evento'
            disabled={isDeleted}
          >
            <Pencil className='h-4 w-4' />
          </ButtonWithTooltip>
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
              'text-destructive hover:text-destructive/80',
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
      </CardContent>
    </Card>
  )
}

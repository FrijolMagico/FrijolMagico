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
import { cn } from '@/lib/utils'
import { StateBadge } from '@/shared/components/state-badge'
import { ActionMenuButton } from '@/shared/components/action-menu-button'

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
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <CardTitle
              className={cn(
                'text-lg',
                isDeleted && 'text-muted-foreground line-through'
              )}
            >
              {evento.nombre}
            </CardTitle>
            <div className='flex items-center gap-2'>
              <StateBadge {...evento.__meta} />
            </div>
          </div>
          <ActionMenuButton
            actions={[
              {
                label: 'Editar',
                onClick: () => openDialog(id)
              }
            ]}
            isDeleted={isDeleted}
            onDelete={() => remove(id)}
            onRestore={() => restore(id)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            'text-muted-foreground text-sm',
            isDeleted && 'opacity-50'
          )}
        >
          {evento.descripcion || 'Sin descripción'}
        </p>
      </CardContent>
    </Card>
  )
}

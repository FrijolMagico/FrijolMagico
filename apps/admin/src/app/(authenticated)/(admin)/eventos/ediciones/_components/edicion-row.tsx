'use client'

import { ImageOff, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useEdicionOperationStore,
  useEdicionProjectionStore
} from '../_store/edicion-ui-store'
import { useEdicionDiaProjectionStore } from '../_store/edicion-dia-ui-store'
import { useLugarProjectionStore } from '../_store/lugar-ui-store'
import { useEventoProjectionStore } from '../../_store/evento-ui-store'
import { useEdicionDialog } from '../_store/edicion-dialog-store'

interface EdicionRowProps {
  id: string
}

const MODALIDAD_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido'
}

const MODALIDAD_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  presencial: 'default',
  online: 'secondary',
  hibrido: 'outline'
}

export function EdicionRow({ id }: EdicionRowProps) {
  const edicion = useEdicionProjectionStore((s) => s.byId[id])
  const evento = useEventoProjectionStore((s) =>
    edicion ? s.byId[edicion.eventoId] : undefined
  )
  const diasById = useEdicionDiaProjectionStore((s) => s.byId)
  const lugarById = useLugarProjectionStore((s) => s.byId)

  const remove = useEdicionOperationStore((s) => s.remove)
  const restore = useEdicionOperationStore((s) => s.restore)
  const openDialog = useEdicionDialog((s) => s.openDialog)

  if (!edicion) return null

  const dias = Object.values(diasById)
    .filter((dia) => dia.eventoEdicionId === id)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  let fechasDisplay = 'Sin fechas'
  if (dias.length === 1) {
    fechasDisplay = new Date(dias[0].fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } else if (dias.length > 1) {
    const first = new Date(dias[0].fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short'
    })
    const last = new Date(dias[dias.length - 1].fecha).toLocaleDateString(
      'es-CL',
      { day: '2-digit', month: 'short', year: 'numeric' }
    )
    fechasDisplay = `${first} – ${last}`
  }

  const firstDia = dias[0]
  const lugar = firstDia?.lugarId ? lugarById[firstDia.lugarId] : undefined

  const modalidades = [...new Set(dias.map((d) => d.modalidad).filter(Boolean))]
  const modalidadDisplay =
    modalidades.length === 1
      ? modalidades[0]
      : modalidades.length > 1
        ? 'mixto'
        : null

  const isDeleted = edicion.__meta?.isDeleted
  const isNew = edicion.__meta?.isNew
  const isUpdated = edicion.__meta?.isUpdated

  return (
    <TableRow
      className={cn('transition-colors', {
        'line-through opacity-50': isDeleted,
        'bg-green-50 dark:bg-green-950/20': isNew,
        'bg-amber-50 dark:bg-amber-950/20': isUpdated && !isNew
      })}
    >
      {/* Poster */}
      <TableCell className='w-12'>
        {edicion.posterUrl ? (
          <img
            src={edicion.posterUrl}
            alt={edicion.nombre ?? edicion.numeroEdicion}
            className='h-10 w-10 rounded object-cover object-center'
          />
        ) : (
          <div className='bg-muted flex h-10 w-10 items-center justify-center rounded'>
            <ImageOff className='text-muted-foreground h-4 w-4' />
          </div>
        )}
      </TableCell>

      {/* Evento */}
      <TableCell className='font-medium'>{evento?.nombre ?? '—'}</TableCell>

      {/* Número */}
      <TableCell className='w-24'>{edicion.numeroEdicion}</TableCell>

      {/* Nombre */}
      <TableCell>{edicion.nombre ?? '—'}</TableCell>

      {/* Fechas */}
      <TableCell className='text-muted-foreground text-sm'>
        {fechasDisplay}
      </TableCell>

      {/* Lugar */}
      <TableCell className='text-sm'>{lugar?.nombre ?? '—'}</TableCell>

      {/* Modalidad */}
      <TableCell className='w-32'>
        {modalidadDisplay ? (
          <Badge variant={MODALIDAD_VARIANTS[modalidadDisplay] ?? 'outline'}>
            {MODALIDAD_LABELS[modalidadDisplay] ?? modalidadDisplay}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>—</span>
        )}
      </TableCell>

      {/* Acciones */}
      <TableCell className='w-24'>
        <div className='flex items-center gap-1'>
          {isDeleted ? (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => restore(id)}
              title='Restaurar'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
          ) : (
            <>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => openDialog(id)}
                title='Editar'
              >
                <Pencil className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive h-8 w-8'
                onClick={() => remove(id)}
                title='Eliminar'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

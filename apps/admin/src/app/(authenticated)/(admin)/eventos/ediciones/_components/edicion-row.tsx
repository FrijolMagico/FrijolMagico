'use client'

import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  useEdicionOperationStore,
  useEdicionProjectionStore
} from '../_store/edicion-ui-store'
import { useEdicionDiaProjectionStore } from '../_store/edicion-dia-ui-store'
import { useLugarProjectionStore } from '../_store/lugar-ui-store'
import { useEventoProjectionStore } from '../../_store/evento-ui-store'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { StateBadge } from '@/shared/components/state-badge'
import { formatEdicionFechas } from '../_lib/format-edicion-fechas'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { PosterThumbnail } from './poster-thumbnail'
import { PosterPreview } from './poster-preview'

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
  presencial: 'outline',
  online: 'outline',
  hibrido: 'outline'
}

export function EdicionRow({ id }: EdicionRowProps) {
  const [isPosterPreviewOpen, setIsPosterPreviewOpen] = useState(false)

  const edicion = useEdicionProjectionStore((s) => s.byId[id])
  const evento = useEventoProjectionStore((s) =>
    edicion ? s.byId[edicion.eventoId] : undefined
  )
  const diasById = useEdicionDiaProjectionStore((s) => s.byId)
  const lugarById = useLugarProjectionStore((s) => s.byId)

  const remove = useEdicionOperationStore((s) => s.remove)
  const restore = useEdicionOperationStore((s) => s.restore)
  const openDialog = useEdicionDialog((s) => s.openDialog)

  const handlePosterUpload = () => {
    console.warn('[EdicionRow] TODO: CDN poster upload not implemented', {
      id: edicion?.id
    })
  }

  const handlePosterDelete = () => {
    console.warn('[EdicionRow] TODO: CDN poster delete not implemented', {
      id: edicion?.id
    })
  }

  if (!edicion) return null

  const dias = Object.values(diasById)
    .filter((dia) => dia.eventoEdicionId === id)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  const fechasDisplay = formatEdicionFechas(dias)

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

  return (
    <TableRow
      className={cn('transition-colors', {
        'bg-destructive/10 border-destructive/20': isDeleted
      })}
    >
      {/* Poster */}
      <TableCell className='flex size-14'>
        <Tooltip>
          <TooltipTrigger
            render={
              <PosterThumbnail
                posterUrl={edicion.posterUrl}
                alt={edicion.nombre + edicion.numeroEdicion}
                onClick={() => setIsPosterPreviewOpen(true)}
              />
            }
          />
          <TooltipContent>
            {edicion.posterUrl ? 'Ver imagen' : 'Agregar imagen'}
          </TooltipContent>
        </Tooltip>
        <PosterPreview
          isOpen={isPosterPreviewOpen}
          posterUrl={edicion.posterUrl}
          alt={edicion.nombre + edicion.numeroEdicion}
          onClose={() => setIsPosterPreviewOpen(false)}
          onUpload={handlePosterUpload}
          onDelete={handlePosterDelete}
        />
      </TableCell>

      {/* Evento */}
      <TableCell>
        <p>
          {evento?.nombre ?? '—'} {edicion.numeroEdicion}
        </p>
        {edicion.nombre && (
          <span className='text-muted-foreground text-sm'>
            {edicion.nombre}
          </span>
        )}
      </TableCell>

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

      <TableCell>
        <StateBadge {...edicion.__meta} />
      </TableCell>

      {/* Acciones */}
      <TableCell className='w-24'>
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
      </TableCell>
    </TableRow>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { Badge } from '@/shared/components/ui/badge'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { deleteEdicionAction } from '../_actions/delete-edicion.action'
import type { EditionDay, Place } from '../_schemas/edicion.schema'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import type { Modality } from '../_types/edition'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { PosterPreview } from './poster-preview'
import { PosterThumbnail } from './poster-thumbnail'

export interface EdicionRowProps {
  edicion: PaginatedEdition
  dias: EditionDay[]
  lugares: Place[]
  eventos: EventoLookup[]
}

const MODALIDAD_LABELS: Record<Modality | 'mixto', string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
  mixto: 'Mixto'
}

const MODALIDAD_VARIANTS: Record<
  Modality | 'mixto',
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  presencial: 'outline',
  online: 'outline',
  hibrido: 'outline',
  mixto: 'secondary'
}

export function EdicionRow({
  edicion,
  dias,
  lugares,
  eventos
}: EdicionRowProps) {
  const [isPosterPreviewOpen, setIsPosterPreviewOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const openDialog = useEdicionDialog((state) => state.openDialog)

  const handlePosterUpload = () => {
    console.warn('[EdicionRow] TODO: CDN poster upload not implemented', {
      id: edicion.id
    })
  }

  const handlePosterDelete = () => {
    console.warn('[EdicionRow] TODO: CDN poster delete not implemented', {
      id: edicion.id
    })
  }

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta edición?')) return

    startTransition(async () => {
      const result = await deleteEdicionAction(
        { success: false },
        { id: edicion.id }
      )

      if (!result.success && result.errors) {
        toast.error(result.errors[0]?.message ?? 'Error al eliminar')
      } else {
        toast.success('Edición eliminada')
      }
    })
  }

  const sortedDias = [...dias].sort(
    (left, right) =>
      new Date(left.fecha).getTime() - new Date(right.fecha).getTime()
  )

  const firstDia = sortedDias[0]
  const lugar = firstDia?.lugarId
    ? lugares.find((entry) => entry.id === firstDia.lugarId)
    : undefined

  const eventoNombre =
    edicion.eventoNombre ||
    eventos.find((evento) => evento.id === edicion.eventoId)?.nombre ||
    '—'

  return (
    <TableRow className={cn('transition-colors', isPending && 'opacity-50')}>
      <TableCell className='flex size-14'>
        <Tooltip>
          <TooltipTrigger
            render={
              <div onClick={() => setIsPosterPreviewOpen(true)}>
                <PosterThumbnail
                  posterUrl={edicion.posterUrl}
                  alt={edicion.nombre || `Edicion ${edicion.numeroEdicion}`}
                />
              </div>
            }
          />
          <TooltipContent>
            {edicion.posterUrl ? 'Ver imagen' : 'Agregar imagen'}
          </TooltipContent>
        </Tooltip>
        <PosterPreview
          isOpen={isPosterPreviewOpen}
          posterUrl={edicion.posterUrl}
          alt={edicion.nombre || `Edicion ${edicion.numeroEdicion}`}
          onClose={() => setIsPosterPreviewOpen(false)}
          onUpload={handlePosterUpload}
          onDelete={handlePosterDelete}
        />
      </TableCell>

      <TableCell>
        <p>
          {eventoNombre} {edicion.numeroEdicion}
        </p>
        {edicion.nombre && (
          <span className='text-muted-foreground text-sm'>
            {edicion.nombre}
          </span>
        )}
      </TableCell>

      <TableCell className='text-muted-foreground text-sm'>
        {edicion.dateRange}
      </TableCell>

      <TableCell className='text-sm'>{lugar?.nombre ?? '—'}</TableCell>

      <TableCell className='w-32'>
        {edicion.modalidadLabel ? (
          <Badge
            variant={
              MODALIDAD_VARIANTS[
                edicion.modalidadLabel as Modality | 'mixto'
              ] ?? 'outline'
            }
          >
            {MODALIDAD_LABELS[edicion.modalidadLabel as Modality | 'mixto'] ??
              edicion.modalidadLabel}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>—</span>
        )}
      </TableCell>

      <TableCell className='w-26' />

      <TableCell className='w-24'>
        <ActionMenuButton
          actions={[
            {
              label: 'Editar',
              onClick: () => openDialog(edicion.id)
            }
          ]}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  )
}

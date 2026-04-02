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
import { deleteEditionAction } from '../_actions/delete-edition.action'
import type { EditionDay } from '../_schemas/edition-day.schema'
import type { EditionWithDays } from '../_schemas/edition-composite.schema'
import type { Place } from '../_schemas/place.schema'
import { useEditionDialog } from '../_store/edition-dialog-store'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { PosterPreview } from './poster-preview'
import { PosterThumbnail } from './poster-thumbnail'

type Modality = NonNullable<EditionDay['modalidad']>

export interface EditionRowProps {
  edition: PaginatedEdition
  days: EditionDay[]
  places: Place[]
  events: EventoLookup[]
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

export function EditionRow({ edition, days, places, events }: EditionRowProps) {
  const [isPosterPreviewOpen, setIsPosterPreviewOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const openUpdateEditionDialog = useEditionDialog(
    (state) => state.openUpdateEditionDialog
  )

  const handlePosterUpload = () => {
    console.warn('[EditionRow] TODO: CDN poster upload not implemented', {
      id: edition.id
    })
  }

  const handlePosterDelete = () => {
    console.warn('[EditionRow] TODO: CDN poster delete not implemented', {
      id: edition.id
    })
  }

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta edición?')) return

    startTransition(async () => {
      const result = await deleteEditionAction(
        { success: false },
        { id: edition.id }
      )

      if (!result.success && result.errors) {
        toast.error(result.errors[0]?.message ?? 'Error al eliminar')
      } else {
        toast.success('Edición eliminada')
      }
    })
  }

  const sortedDays = [...days].sort(
    (left, right) =>
      new Date(left.fecha).getTime() - new Date(right.fecha).getTime()
  )

  const firstDay = sortedDays[0]
  const place = firstDay?.lugarId
    ? places.find((entry) => entry.id === firstDay.lugarId)
    : undefined

  const eventName =
    edition.eventoNombre ||
    events.find((event) => event.id === edition.eventoId)?.nombre ||
    '—'

  const editionWithDays: EditionWithDays = {
    id: edition.id,
    eventoId: edition.eventoId,
    numeroEdicion: edition.numeroEdicion,
    nombre: edition.nombre,
    posterUrl: edition.posterUrl,
    days: sortedDays.map((day) => ({
      tempId: crypto.randomUUID(),
      existingId: day.id,
      fecha: day.fecha,
      horaInicio: day.horaInicio,
      horaFin: day.horaFin,
      modalidad: day.modalidad,
      lugarId: day.lugarId
    }))
  }

  return (
    <TableRow className={cn('transition-colors', isPending && 'opacity-50')}>
      <TableCell className='flex size-14'>
        <Tooltip>
          <TooltipTrigger
            render={
              <div onClick={() => setIsPosterPreviewOpen(true)}>
                <PosterThumbnail
                  posterUrl={edition.posterUrl}
                  alt={edition.nombre || `Edition ${edition.numeroEdicion}`}
                />
              </div>
            }
          />
          <TooltipContent>
            {edition.posterUrl ? 'Ver imagen' : 'Agregar imagen'}
          </TooltipContent>
        </Tooltip>
        <PosterPreview
          isOpen={isPosterPreviewOpen}
          posterUrl={edition.posterUrl}
          alt={edition.nombre || `Edition ${edition.numeroEdicion}`}
          onClose={() => setIsPosterPreviewOpen(false)}
          onUpload={handlePosterUpload}
          onDelete={handlePosterDelete}
        />
      </TableCell>

      <TableCell>
        <p>
          {eventName} {edition.numeroEdicion}
        </p>
        {edition.nombre && (
          <span className='text-muted-foreground text-sm'>
            {edition.nombre}
          </span>
        )}
      </TableCell>

      <TableCell className='text-muted-foreground text-sm'>
        {edition.dateRange}
      </TableCell>

      <TableCell className='text-sm'>{place?.nombre ?? '—'}</TableCell>

      <TableCell className='w-32'>
        {edition.modalidadLabel ? (
          <Badge
            variant={
              MODALIDAD_VARIANTS[
                edition.modalidadLabel as Modality | 'mixto'
              ] ?? 'outline'
            }
          >
            {MODALIDAD_LABELS[edition.modalidadLabel as Modality | 'mixto'] ??
              edition.modalidadLabel}
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
              onClick: () => openUpdateEditionDialog(editionWithDays)
            }
          ]}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  )
}

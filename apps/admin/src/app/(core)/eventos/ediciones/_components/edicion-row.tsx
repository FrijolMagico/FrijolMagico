'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { TableCell, TableRow } from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { formatEdicionFechas } from '../_lib/format-edicion-fechas'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { PosterThumbnail } from './poster-thumbnail'
import { PosterPreview } from './poster-preview'
import { deleteEdicionAction } from '../_actions/delete-edicion.action'
import type { EdicionDiaEntry, LugarEntry } from '../_types'
import type { EventoEntry } from '../../_types'
import type { PaginatedEdicion } from '../_types/paginated-edicion'
import { type Modality, isModality } from '../_types/edition'

export interface EdicionRowProps {
  edicion: PaginatedEdicion
  dias: EdicionDiaEntry[]
  lugares: LugarEntry[]
  eventos: EventoEntry[]
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
  const openDialog = useEdicionDialog((s) => s.openDialog)

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
      const formData = new FormData()
      formData.append('id', edicion.id)
      const result = await deleteEdicionAction({ success: false }, formData)
      if (!result.success && result.errors) {
        toast.error(result.errors[0]?.message ?? 'Error al eliminar')
      } else {
        toast.success('Edición eliminada')
      }
    })
  }

  const sortedDias = [...dias].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  const fechasDisplay = formatEdicionFechas(sortedDias)

  const firstDia = sortedDias[0]
  const lugar = firstDia?.lugarId
    ? lugares.find((l) => l.id === firstDia.lugarId)
    : undefined

  const modalidades = Array.from(
    new Set(sortedDias.map((d) => d.modalidad).filter(isModality))
  )

  const modalidadDisplay: Modality | 'mixto' | null =
    modalidades.length === 1
      ? modalidades[0]
      : modalidades.length > 1
        ? 'mixto'
        : null

  const eventoNombre =
    edicion.eventoNombre ||
    eventos.find((e) => e.id === edicion.eventoId)?.nombre ||
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
        {fechasDisplay}
      </TableCell>

      <TableCell className='text-sm'>{lugar?.nombre ?? '—'}</TableCell>

      <TableCell className='w-32'>
        {modalidadDisplay ? (
          <Badge variant={MODALIDAD_VARIANTS[modalidadDisplay] ?? 'outline'}>
            {MODALIDAD_LABELS[modalidadDisplay] ?? modalidadDisplay}
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

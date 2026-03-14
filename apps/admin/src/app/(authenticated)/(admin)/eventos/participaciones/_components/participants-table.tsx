'use client'

import { IconUsersGroup, IconUser } from '@tabler/icons-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { Badge } from '@/shared/components/ui/badge'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'
import type { ExpositorEntry, ActividadEntry } from '../_types'

interface ParticipantRow {
  key: string
  artistaId: string | null
  agrupacionId: string | null
  artistaNombre: string | null
  artistaPseudonimo: string | null
  artistaFoto: string | null
  artistaEstadoSlug: string | null
  agrupacionNombre: string | null
  exposicion: ExpositorEntry | null
  actividades: ActividadEntry[]
}

function buildParticipantRows(
  expositores: ExpositorEntry[],
  actividades: ActividadEntry[]
): ParticipantRow[] {
  const map = new Map<string, ParticipantRow>()

  for (const expo of expositores) {
    const key = expo.artistaId
      ? `artista:${expo.artistaId}`
      : `agrupacion:${expo.agrupacionId}`

    map.set(key, {
      key,
      artistaId: expo.artistaId,
      agrupacionId: expo.agrupacionId,
      artistaNombre: expo.artistaNombre ?? null,
      artistaPseudonimo: expo.artistaPseudonimo ?? null,
      artistaFoto: expo.artistaFoto ?? null,
      artistaEstadoSlug: expo.artistaEstadoSlug ?? null,
      agrupacionNombre: expo.agrupacionNombre ?? null,
      exposicion: expo,
      actividades: []
    })
  }

  for (const activ of actividades) {
    const key = activ.artistaId
      ? `artista:${activ.artistaId}`
      : `agrupacion:${activ.agrupacionId}`

    const existing = map.get(key)
    if (existing) {
      existing.actividades.push(activ)
    } else {
      map.set(key, {
        key,
        artistaId: activ.artistaId,
        agrupacionId: activ.agrupacionId,
        artistaNombre: activ.artistaNombre ?? null,
        artistaPseudonimo: activ.artistaPseudonimo ?? null,
        artistaFoto: activ.artistaFoto ?? null,
        artistaEstadoSlug: activ.artistaEstadoSlug ?? null,
        agrupacionNombre: activ.agrupacionNombre ?? null,
        exposicion: null,
        actividades: [activ]
      })
    }
  }

  return Array.from(map.values())
}

function getEstadoVariant(estado: string) {
  switch (estado) {
    case 'seleccionado':
    case 'confirmado':
      return 'default'
    case 'completado':
      return 'secondary'
    case 'desistido':
    case 'cancelado':
    case 'ausente':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function ParticipantsTable({
  expositores,
  actividades
}: {
  expositores: ExpositorEntry[]
  actividades: ActividadEntry[]
}) {
  const selectedParticipantId = useParticipacionesViewStore(
    (s) => s.selectedParticipantId
  )
  const setSelectedParticipantId = useParticipacionesViewStore(
    (s) => s.setSelectedParticipantId
  )

  const rows = buildParticipantRows(expositores, actividades)

  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground flex flex-1 items-center justify-center rounded-md border border-dashed border-zinc-800 p-8 text-center'>
        No hay participantes en esta edición.
      </div>
    )
  }

  return (
    <Table className='border'>
      <TableHeader>
        <TableRow>
          <TableHead>Participante</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const isCollective = !row.artistaId
          const name = isCollective
            ? row.agrupacionNombre || 'Agrupación sin nombre'
            : row.artistaPseudonimo || row.artistaNombre || 'Artista sin nombre'
          const isVetado = row.artistaEstadoSlug === 'vetado'

          return (
            <TableRow
              key={row.key}
              className='cursor-pointer'
              data-state={
                selectedParticipantId === row.key ? 'selected' : undefined
              }
              onClick={() => setSelectedParticipantId(row.key)}
            >
              <TableCell>
                <div className='flex items-center gap-3'>
                  <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                    {isCollective ? (
                      <IconUsersGroup className='text-muted-foreground h-4 w-4' />
                    ) : (
                      <IconUser className='text-muted-foreground h-4 w-4' />
                    )}
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {name}
                      {isVetado && (
                        <Badge
                          variant='destructive'
                          className='ml-2 text-[10px]'
                        >
                          Vetado
                        </Badge>
                      )}
                    </span>
                    <span className='text-muted-foreground text-xs'>
                      {isCollective ? 'Agrupación' : 'Individual'}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {row.exposicion && (
                    <Badge variant='secondary'>
                      Expo: {row.exposicion.disciplinaSlug || 'Sin disciplina'}
                    </Badge>
                  )}
                  {row.actividades.map((activ) => (
                    <Badge key={activ.id} variant='outline'>
                      Act: {activ.tipoActividadSlug || 'Sin tipo'}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className='flex flex-col gap-1'>
                  {row.exposicion && (
                    <Badge variant={getEstadoVariant(row.exposicion.estado)}>
                      {row.exposicion.estado}
                    </Badge>
                  )}
                  {!row.exposicion && row.actividades.length > 0 && (
                    <Badge
                      variant={getEstadoVariant(row.actividades[0].estado)}
                    >
                      {row.actividades[0].estado}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

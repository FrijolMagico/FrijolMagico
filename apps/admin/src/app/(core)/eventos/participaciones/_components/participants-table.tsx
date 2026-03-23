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
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { PaginationControls } from '@/shared/components/pagination-controls'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'
import {
  isParticipationStatus,
  type ParticipantListRow,
  type ParticipationStatus
} from '../_types'
import type { PaginatedResponse } from '@/shared/types/pagination'

function toParticipationStatus(
  value: string | null
): ParticipationStatus | null {
  return value && isParticipationStatus(value) ? value : null
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
  filters,
  pagination,
  onSearchChange,
  onEstadoChange,
  onClearFilters,
  onPageChange
}: {
  filters: { search: string; estado: ParticipationStatus | null }
  pagination: PaginatedResponse<ParticipantListRow>
  onSearchChange: (search: string) => void
  onEstadoChange: (estado: ParticipationStatus | null) => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
}) {
  const selectedParticipantId = useParticipacionesViewStore(
    (s) => s.selectedParticipantId
  )
  const setSelectedParticipantId = useParticipacionesViewStore(
    (s) => s.setSelectedParticipantId
  )

  const rows = pagination.data
  const hasActiveFilters = filters.search !== '' || filters.estado !== null

  const handleSearchInputChange = (value: string) => {
    onSearchChange(value)
  }

  if (rows.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <Input
            key={filters.search}
            defaultValue={filters.search}
            onChange={(event) => handleSearchInputChange(event.target.value)}
            placeholder='Buscar participante...'
            className='max-w-sm'
          />
          <div className='flex items-center gap-2'>
            <Select
              value={filters.estado ?? 'all'}
              onValueChange={(value) =>
                onEstadoChange(
                  value === 'all' ? null : toParticipationStatus(value)
                )
              }
            >
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Estado' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos los estados</SelectItem>
                <SelectItem value='seleccionado'>Seleccionado</SelectItem>
                <SelectItem value='confirmado'>Confirmado</SelectItem>
                <SelectItem value='desistido'>Desistido</SelectItem>
                <SelectItem value='cancelado'>Cancelado</SelectItem>
                <SelectItem value='ausente'>Ausente</SelectItem>
                <SelectItem value='completado'>Completado</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant='ghost' size='sm' onClick={onClearFilters}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
        <div className='text-muted-foreground flex flex-1 items-center justify-center rounded-md border border-dashed border-zinc-800 p-8 text-center'>
          No hay participantes en esta edición.
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <Input
          key={filters.search}
          defaultValue={filters.search}
          onChange={(event) => handleSearchInputChange(event.target.value)}
          placeholder='Buscar participante...'
          className='max-w-sm'
        />
        <div className='flex items-center gap-2'>
          <Select
            value={filters.estado ?? 'all'}
            onValueChange={(value) =>
              onEstadoChange(
                value === 'all' ? null : toParticipationStatus(value)
              )
            }
          >
            <SelectTrigger className='w-44'>
              <SelectValue placeholder='Estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los estados</SelectItem>
              <SelectItem value='seleccionado'>Seleccionado</SelectItem>
              <SelectItem value='confirmado'>Confirmado</SelectItem>
              <SelectItem value='desistido'>Desistido</SelectItem>
              <SelectItem value='cancelado'>Cancelado</SelectItem>
              <SelectItem value='ausente'>Ausente</SelectItem>
              <SelectItem value='completado'>Completado</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={onClearFilters}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        itemNoun='participantes'
      />

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
            const isCollective = row.participantType !== 'artista'
            const isBand = row.participantType === 'banda'
            const name = isBand
              ? row.bandaNombre || 'Banda sin nombre'
              : isCollective
                ? row.agrupacionNombre || 'Agrupación sin nombre'
                : row.artistaPseudonimo ||
                  row.artistaNombre ||
                  'Artista sin nombre'
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
                        {isBand
                          ? 'Banda'
                          : isCollective
                            ? 'Agrupación'
                            : 'Individual'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {row.exposicion && (
                      <Badge variant='secondary'>
                        Expo:{' '}
                        {row.exposicion.disciplinaSlug || 'Sin disciplina'}
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

      <PaginationControls
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        itemNoun='participantes'
      />
    </div>
  )
}

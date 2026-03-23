'use client'

import { useState } from 'react'
import { useQueryStates } from 'nuqs'
import { IconPlus, IconChevronDown } from '@tabler/icons-react'
import {
  getTotalPages,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover'
import { ParticipantsTable } from './participants-table'
import { ConfigurationSheet } from './configuration-sheet'
import { AddExpositorDialog } from './add-expositor-dialog'
import { AddActividadDialog } from './add-actividad-dialog'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'
import { participacionesSearchParams } from '../_lib/search-params'
import type {
  ParticipationStatus,
  ParticipacionesViewData,
  ParticipantListRow
} from '../_types'

interface ParticipacionesContainerProps {
  data: ParticipacionesViewData
  edicionId: number
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export function ParticipacionesContainer({
  data,
  edicionId,
  pagination
}: ParticipacionesContainerProps) {
  const [filters, setFilters] = useQueryStates(participacionesSearchParams, {
    shallow: false
  })
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { setAddExpositorDialogOpen, setAddActividadDialogOpen } =
    useParticipacionesViewStore()

  const currentEdicion = data.ediciones.find((e) => e.id === edicionId)
  const currentLabel = currentEdicion
    ? `${currentEdicion.eventoNombre} — Ed. ${currentEdicion.nombre ?? currentEdicion.id}`
    : 'Seleccionar edición'

  const handleEditionSelect = (slugOrId: string) => {
    setPopoverOpen(false)
    void setFilters({ edicion: slugOrId })
  }

  const handleSearchChange = (search: string) => {
    void setFilters({ page: 1, search })
  }

  const handleEstadoChange = (estado: ParticipationStatus | null) => {
    void setFilters({ page: 1, estado })
  }

  const handleClearFilters = () => {
    void setFilters({ page: 1, search: '', estado: null })
  }

  const handlePageChange = (page: number) => {
    void setFilters({ page })
  }

  const participantesPagination: PaginatedResponse<ParticipantListRow> = {
    data: data.participantes,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    totalPages: getTotalPages(pagination.total, pagination.pageSize)
  }

  const totalActividades = data.participantes.reduce(
    (total, participante) => total + participante.actividades.length,
    0
  )

  const disciplinasForDialog = data.disciplinas.map((disciplina) => ({
    ...disciplina,
    id: String(disciplina.id)
  }))

  const tiposActividadForDialog = data.tiposActividad.map((tipoActividad) => ({
    ...tipoActividad,
    id: Number(tipoActividad.id)
  }))

  // Group editions by event name
  const groupedEdiciones = data.ediciones.reduce(
    (acc, edicion) => {
      const key = edicion.eventoNombre
      if (!acc[key]) acc[key] = []
      acc[key].push(edicion)
      return acc
    },
    {} as Record<string, typeof data.ediciones>
  )

  return (
    <div className='flex h-full flex-col gap-6'>
      {/* Top Bar: Switcher + Add Buttons */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <Button variant='outline' className='w-75 justify-between'>
                <span className='truncate'>{currentLabel}</span>
                <IconChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            }
          />
          <PopoverContent className='w-75 p-0' align='start'>
            <div className='max-h-75 overflow-auto py-2'>
              {Object.entries(groupedEdiciones).map(([eventName, editions]) => (
                <div key={eventName} className='mb-2'>
                  <div className='text-muted-foreground px-3 py-1.5 text-xs font-semibold'>
                    {eventName}
                  </div>
                  {editions.map((ed) => (
                    <button
                      key={ed.id}
                      className='hover:bg-accent hover:text-accent-foreground w-full px-3 py-1.5 text-left text-sm'
                      onClick={() =>
                        handleEditionSelect(ed.slug ?? String(ed.id))
                      }
                    >
                      Edición {ed.nombre ?? ed.id}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className='flex items-center gap-2'>
          <Button size='sm' onClick={() => setAddExpositorDialogOpen(true)}>
            <IconPlus className='mr-2 h-4 w-4' /> Expositor
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setAddActividadDialogOpen(true)}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Actividad
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className='text-muted-foreground flex items-center gap-6 text-sm'>
        <span>
          <strong className='text-foreground'>{pagination.total}</strong>{' '}
          participantes
        </span>
        <span>
          <strong className='text-foreground'>{totalActividades}</strong>{' '}
          actividades
        </span>
      </div>

      <ParticipantsTable
        filters={filters}
        pagination={participantesPagination}
        onSearchChange={handleSearchChange}
        onEstadoChange={handleEstadoChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
      />

      <ConfigurationSheet data={data} />

      <AddExpositorDialog
        edicionId={String(edicionId)}
        artistas={data.artistas.map((artista) => ({
          ...artista,
          id: String(artista.id)
        }))}
        agrupaciones={data.agrupaciones.map((agrupacion) => ({
          ...agrupacion,
          id: String(agrupacion.id),
          descripcion: null,
          correo: null
        }))}
        disciplinas={disciplinasForDialog}
      />

      <AddActividadDialog
        edicionId={edicionId}
        artistas={data.artistas}
        agrupaciones={data.agrupaciones}
        bandas={data.bandas}
        tiposActividad={tiposActividadForDialog}
      />
    </div>
  )
}

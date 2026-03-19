'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IconPlus, IconChevronDown } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { buildAdminListUrl } from '@/shared/lib/admin-list-url'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover'
import type { ParticipacionesData } from '../_lib/get-participaciones-data'
import type { ParticipacionesListQueryFilters } from '@/shared/types/admin-list-filters'
import type { ListQueryParams } from '@/shared/types/pagination'
import { ParticipantsTable } from './participants-table'
import { ConfigurationSheet } from './configuration-sheet'
import { AddExpositorDialog } from './add-expositor-dialog'
import { AddActividadDialog } from './add-actividad-dialog'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'

interface ParticipacionesContainerProps {
  data: ParticipacionesData
  edicionId: string
  query: ListQueryParams<ParticipacionesListQueryFilters>
}

export function ParticipacionesContainer({
  data,
  edicionId,
  query
}: ParticipacionesContainerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { setAddExpositorDialogOpen, setAddActividadDialogOpen } =
    useParticipacionesViewStore()

  const currentEdicion = data.ediciones.find((e) => e.id === edicionId)
  const currentLabel = currentEdicion
    ? `${currentEdicion.eventoNombre} — Ed. ${currentEdicion.nombre ?? currentEdicion.id}`
    : 'Seleccionar edición'

  const filters = {
    search: query.search,
    estado: query.filters.estado ?? null
  }

  const replaceListUrl = (nextUrl: string) => {
    router.replace(`${pathname}${nextUrl}`, { scroll: false })
  }

  const handleEditionSelect = (slugOrId: string) => {
    setPopoverOpen(false)
    router.push(`?edicion=${slugOrId}`)
  }

  const handleSearchChange = (search: string) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page: 1, search }))
  }

  const handleEstadoChange = (estado: string | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { estado }
      })
    )
  }

  const handleClearFilters = () => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        search: '',
        filters: { estado: null }
      })
    )
  }

  const handlePageChange = (page: number) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page }))
  }

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
                      onClick={() => handleEditionSelect(ed.slug ?? ed.id)}
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
          <strong className='text-foreground'>{data.participants.total}</strong>{' '}
          participantes
        </span>
        <span>
          <strong className='text-foreground'>{data.actividades.length}</strong>{' '}
          actividades
        </span>
      </div>

      <ParticipantsTable
        filters={filters}
        pagination={data.participants}
        onSearchChange={handleSearchChange}
        onEstadoChange={handleEstadoChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
      />

      <ConfigurationSheet data={data} />

      <AddExpositorDialog
        edicionId={edicionId}
        artistas={data.artistas}
        agrupaciones={data.agrupaciones}
        disciplinas={data.disciplinas}
      />

      <AddActividadDialog
        edicionId={edicionId}
        artistas={data.artistas}
        agrupaciones={data.agrupaciones}
        tiposActividad={data.tiposActividad}
      />
    </div>
  )
}

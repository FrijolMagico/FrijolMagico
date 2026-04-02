'use client'

import { throttle, useQueryStates } from 'nuqs'
import { EmptyState } from '@/shared/components/empty-state'
import { PaginationControls } from '@/shared/components/pagination-controls'
import type { PaginatedResponse } from '@/shared/types/pagination'
import type { EditionDay } from '../_schemas/edition-day.schema'
import type { Place } from '../_schemas/place.schema'
import { edicionSearchParams } from '../_lib/search-params'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { CreateEditionDialog } from './create-edition-dialog'
import { EditionsFilters } from './edition-filters'
import { EditionTable } from './edition-table'
import { UpdateEditionDialog } from './update-edition-dialog'

interface EdicionContainerProps {
  editions: PaginatedEdition[]
  days: EditionDay[]
  places: Place[]
  events: EventoLookup[]
  pagination: PaginatedResponse<PaginatedEdition>
}

export function EditionsContainer({
  editions,
  days,
  places,
  events,
  pagination
}: EdicionContainerProps) {
  const [filters, setFilters] = useQueryStates(edicionSearchParams, {
    shallow: false,
    limitUrlUpdates: throttle(150)
  })

  const handleClearFilters = () => {
    void setFilters({ page: 1, search: '', evento: null })
  }

  if (editions.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <CreateEditionDialog eventos={events} lugares={places} />
        </div>

        <EmptyState
          title='Sin ediciones'
          description='No hay ediciones que coincidan con los filtros seleccionados.'
          action={{
            label: 'Limpiar filtros',
            onClick: handleClearFilters
          }}
        />

        <UpdateEditionDialog eventos={events} lugares={places} />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-end gap-2'>
        <EditionsFilters
          events={events}
          filters={filters}
          setFilters={setFilters}
        />
        <CreateEditionDialog eventos={events} lugares={places} />
      </div>

      <PaginationControls
        {...pagination}
        onPageChange={(page) => void setFilters({ page })}
        itemNoun='ediciones'
      />

      <EditionTable
        editions={editions}
        days={days}
        places={places}
        events={events}
      />

      <PaginationControls
        {...pagination}
        onPageChange={(page) => void setFilters({ page })}
        itemNoun='ediciones'
      />

      <UpdateEditionDialog eventos={events} lugares={places} />
    </div>
  )
}

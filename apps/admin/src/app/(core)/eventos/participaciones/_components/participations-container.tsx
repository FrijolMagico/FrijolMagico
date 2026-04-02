'use client'

import { useQueryStates } from 'nuqs'
import { CreateActivityDialog } from './create-activity-dialog'
import { CreateExhibitionDialog } from './create-exhibition-dialog'
import { participacionesSearchParams } from '../_lib/search-params'
import type { ParticipationsViewData } from '../_types/participations.types'
import { ParticipantsFilters } from './participants-filters'
import { EmptyState } from '@/shared/components/empty-state'
import { ParticipationsEditionSelector } from './participations-edition-selector'
import { ParticipantsContainer } from './participants-container'
import { UpdateExhibitionDialog } from './update-exhibition-dialog'
import { UpdateActivityDialog } from './update-activity-dialog'

interface ParticipationsContainerProps {
  data: ParticipationsViewData
}

export function ParticipationsContainer({
  data
}: ParticipationsContainerProps) {
  const [filters, setFilters] = useQueryStates(participacionesSearchParams, {
    shallow: false
  })

  return (
    <div className='flex h-full flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <ParticipationsEditionSelector
          currentEdition={data.edition}
          editions={data.editions}
          setFilters={setFilters}
        />

        <div className='flex items-center gap-2'>
          <CreateExhibitionDialog
            edition={{
              id: data.edition.id,
              editionNumber: data.edition.editionNumber,
              eventName: data.edition.eventName
            }}
            artistas={data.artists}
            agrupaciones={data.collectives}
          />

          <CreateActivityDialog
            edition={{
              id: data.edition.id,
              editionNumber: data.edition.editionNumber,
              eventName: data.edition.eventName
            }}
            artistas={data.artists}
            agrupaciones={data.collectives}
            bandas={data.bands}
          />
        </div>
      </div>

      <ParticipantsFilters filters={filters} setFilters={setFilters} />

      {data.edition.participations.length === 0 ? (
        <EmptyState
          title='No se encontraron participantes'
          description='No hay participantes que coincidan con los filtros aplicados.'
          action={{
            label: 'Limpiar filtros',
            onClick: () => setFilters({ search: '', estado: null })
          }}
        />
      ) : (
        <ParticipantsContainer participations={data.edition.participations} />
      )}

      {/* NOTE: We could pass participationId here instead leaving each participation with its own participationId field */}
      <UpdateExhibitionDialog
        edition={{
          id: data.edition.id,
          editionNumber: data.edition.editionNumber,
          eventName: data.edition.eventName
        }}
      />
      <UpdateActivityDialog
        edition={{
          id: data.edition.id,
          editionNumber: data.edition.editionNumber,
          eventName: data.edition.eventName
        }}
      />
    </div>
  )
}

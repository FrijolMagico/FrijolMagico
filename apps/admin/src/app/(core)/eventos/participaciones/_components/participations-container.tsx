'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryStates } from 'nuqs'
import { toast } from 'sonner'
import { EmptyState } from '@/shared/components/empty-state'
import { deleteActivityAction } from '../_actions/activities/delete-activity.action'
import { deleteExhibitionAction } from '../_actions/exhibitions/delete-exhibition.action'
import { participacionesSearchParams } from '../_lib/search-params'
import { useParticipationsStore } from '../_store/use-participations-store'
import type { ParticipationsViewData } from '../_types/participations.types'
import { CreateActivityDialog } from './create-activity-dialog'
import { CreateExhibitionDialog } from './create-exhibition-dialog'
import { DeleteParticipationDialogs } from './delete-participation-dialog'
import { ParticipantsContainer } from './participants-container'
import { ParticipantsFilters } from './participants-filters'
import { ParticipationsEditionSelector } from './participations-edition-selector'
import { UpdateActivityDialog } from './update-activity-dialog'
import { UpdateExhibitionDialog } from './update-exhibition-dialog'

interface ParticipationsContainerProps {
  data: ParticipationsViewData
}

interface ParticipationDeletionResult {
  success: boolean
  errors?: { message?: string }[]
}

interface RunParticipationDeletionOptions {
  execute: () => Promise<ParticipationDeletionResult>
  setPending: (isPending: boolean) => void
  onSuccess: () => void
  onError: (message?: string) => void
  close: () => void
  refresh: () => void
}

export async function runParticipationDeletion({
  execute,
  setPending,
  onSuccess,
  onError,
  close,
  refresh
}: RunParticipationDeletionOptions) {
  setPending(true)

  try {
    const result = await execute()
    if (!result.success) {
      onError(result.errors?.[0]?.message)
      return false
    }

    onSuccess()
    close()
    refresh()
    return true
  } catch (error) {
    onError(
      error instanceof Error ? error.message : 'Error inesperado al eliminar'
    )
    return false
  } finally {
    setPending(false)
  }
}

export function ParticipationsContainer({
  data
}: ParticipationsContainerProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [filters, setFilters] = useQueryStates(participacionesSearchParams, {
    shallow: false
  })
  const selectedExhibition = useParticipationsStore((s) => s.selectedExhibition)
  const selectedActivity = useParticipationsStore((s) => s.selectedActivity)
  const isRemoveExhibitionDialogOpen = useParticipationsStore(
    (s) => s.isRemoveExhibitionDialogOpen
  )
  const isRemoveActivityDialogOpen = useParticipationsStore(
    (s) => s.isRemoveActivityDialogOpen
  )
  const setRemoveExhibitionDialogOpen = useParticipationsStore(
    (s) => s.setRemoveExhibitionDialogOpen
  )
  const setRemoveActivityDialogOpen = useParticipationsStore(
    (s) => s.setRemoveActivityDialogOpen
  )
  const closeUpdateDialogs = useParticipationsStore((s) => s.closeUpdateDialogs)

  async function handleRemoveExhibition() {
    const exhibition = selectedExhibition.exhibition
    if (!exhibition || isPending) return

    await runParticipationDeletion({
      execute: () =>
        deleteExhibitionAction({ success: false }, { id: exhibition.id }),
      setPending: setIsPending,
      onSuccess: () => toast.success('Expositor eliminado'),
      onError: (message) => toast.error(message ?? 'Error al quitar expositor'),
      close: closeUpdateDialogs,
      refresh: router.refresh
    })
  }

  async function handleRemoveActivity() {
    const activity = selectedActivity.activity
    if (!activity || isPending) return

    await runParticipationDeletion({
      execute: () => deleteActivityAction({ id: activity.id }),
      setPending: setIsPending,
      onSuccess: () => toast.success('Actividad eliminada'),
      onError: (message) =>
        toast.error(message ?? 'Error al eliminar actividad'),
      close: closeUpdateDialogs,
      refresh: router.refresh
    })
  }

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
      <DeleteParticipationDialogs
        isRemoveExhibitionDialogOpen={isRemoveExhibitionDialogOpen}
        isRemoveActivityDialogOpen={isRemoveActivityDialogOpen}
        onRemoveExhibitionOpenChange={setRemoveExhibitionDialogOpen}
        onRemoveActivityOpenChange={setRemoveActivityDialogOpen}
        onConfirmRemoveExhibition={handleRemoveExhibition}
        onConfirmRemoveActivity={handleRemoveActivity}
        isPending={isPending}
      />
    </div>
  )
}

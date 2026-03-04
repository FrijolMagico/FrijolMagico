'use client'

import { suggestNextEdicion } from '../../_lib/nomenclature-utils'
import { useEventoProjectionStore } from '../../_store/evento-ui-store'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import {
  useEdicionOperationStore,
  useEdicionProjectionStore
} from '../_store/edicion-ui-store'
import {
  useEdicionDiaOperationStore,
  useEdicionDiaProjectionStore
} from '../_store/edicion-dia-ui-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import type { EdicionEntry, EdicionDiaEntry } from '../_types'
import type { EventoEntry } from '../../_types'
import type { ProjectedEntity } from '@/shared/operations/projection'
import { EdicionFormContent } from './edicion-dialog-form'
import { EdicionFormState } from '../_types/edition'

function computeInitialState(
  selectedEdicion: ProjectedEntity<EdicionEntry> | null,
  diaById: Record<string, ProjectedEntity<EdicionDiaEntry>>,
  edicionIds: string[],
  edicionById: Record<string, ProjectedEntity<EdicionEntry>>,
  eventoById: Record<string, ProjectedEntity<EventoEntry>>,
  eventoIds: string[]
): EdicionFormState {
  if (selectedEdicion) {
    const existingDays = Object.values(diaById)
      .filter(
        (d) => d.eventoEdicionId === selectedEdicion.id && !d.__meta?.isDeleted
      )
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    return {
      eventoId: selectedEdicion.eventoId,
      numeroEdicion: selectedEdicion.numeroEdicion,
      nombre: selectedEdicion.nombre ?? '',
      days: existingDays.map((day) => ({
        tempId: crypto.randomUUID(),
        existingId: day.id,
        fecha: day.fecha,
        horaInicio: day.horaInicio,
        horaFin: day.horaFin,
        modalidad: day.modalidad,
        lugarId: day.lugarId
      }))
    }
  }

  const existingNums = edicionIds
    .map((id) => edicionById[id])
    .filter((e) => !!e && !e.__meta?.isDeleted)
    .map((e) => e.numeroEdicion)

  const defaultEventoId =
    eventoIds.find(
      (id) => eventoById[id]?.nombre === 'Festival Frijol Mágico'
    ) ?? ''

  return {
    eventoId: defaultEventoId,
    numeroEdicion: suggestNextEdicion(existingNums).suggested,
    nombre: '',
    days: []
  }
}

export function EdicionDialog() {
  const isOpen = useEdicionDialog((s) => s.isDialogOpen)
  const selectedEdicionId = useEdicionDialog((s) => s.selectedEdicionId)
  const closeDialog = useEdicionDialog((s) => s.closeDialog)

  const eventoById = useEventoProjectionStore((s) => s.byId)
  const eventoIds = useEventoProjectionStore((s) => s.allIds)

  const edicionById = useEdicionProjectionStore((s) => s.byId)
  const edicionIds = useEdicionProjectionStore((s) => s.allIds)

  const diaById = useEdicionDiaProjectionStore((s) => s.byId)

  const addEdicion = useEdicionOperationStore((s) => s.add)
  const updateEdicion = useEdicionOperationStore((s) => s.update)

  const addDia = useEdicionDiaOperationStore((s) => s.add)
  const updateDia = useEdicionDiaOperationStore((s) => s.update)
  const removeDia = useEdicionDiaOperationStore((s) => s.remove)

  const selectedEdicion = selectedEdicionId
    ? (edicionById[selectedEdicionId] ?? null)
    : null

  const isReady = !selectedEdicionId || selectedEdicion !== null

  return (
    <EntityFormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={selectedEdicionId ? 'Editar edición' : 'Nueva edición'}
      className='sm:max-w-3xl'
    >
      {isOpen && isReady && (
        <EdicionFormContent
          key={selectedEdicionId ?? 'new'}
          initialFormState={computeInitialState(
            selectedEdicion,
            diaById,
            edicionIds,
            edicionById,
            eventoById,
            eventoIds
          )}
          selectedEdicionId={selectedEdicionId}
          selectedEdicion={selectedEdicion}
          eventoById={eventoById}
          eventoIds={eventoIds}
          closeDialog={closeDialog}
          addEdicion={addEdicion}
          updateEdicion={updateEdicion}
          addDia={addDia}
          updateDia={updateDia}
          removeDia={removeDia}
          diaById={diaById}
        />
      )}
    </EntityFormDialog>
  )
}

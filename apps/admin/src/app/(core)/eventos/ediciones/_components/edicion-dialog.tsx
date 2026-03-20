'use client'

import { suggestNextEdicion } from '../../_lib/nomenclature-utils'
import type { Edition, EditionDay, Place } from '../_schemas/edicion.schema'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import type { DayFormState, EdicionFormState } from '../_types/edition'
import type { EventoLookup } from '../_types'
import { EdicionFormContent } from './edicion-dialog-form'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'

function mapEditionDayToFormState(day: EditionDay): DayFormState {
  return {
    tempId: crypto.randomUUID(),
    existingId: day.id,
    fecha: day.fecha,
    horaInicio: day.horaInicio,
    horaFin: day.horaFin,
    modalidad: day.modalidad,
    lugarId: day.lugarId
  }
}

function computeInitialState(
  selectedEdicion: Edition | null,
  dias: EditionDay[],
  ediciones: Edition[],
  eventos: EventoLookup[]
): EdicionFormState {
  if (selectedEdicion) {
    const existingDays = dias
      .filter((day) => day.eventoEdicionId === selectedEdicion.id)
      .sort(
        (left, right) =>
          new Date(left.fecha).getTime() - new Date(right.fecha).getTime()
      )

    return {
      eventoId: selectedEdicion.eventoId,
      numeroEdicion: selectedEdicion.numeroEdicion,
      nombre: selectedEdicion.nombre ?? '',
      days: existingDays.map(mapEditionDayToFormState)
    }
  }

  const existingNums = ediciones.map((edition) => edition.numeroEdicion)
  const defaultEvento = eventos.find(
    (evento) => evento.nombre === 'Festival Frijol Mágico'
  )

  return {
    eventoId: defaultEvento?.id ?? null,
    numeroEdicion: suggestNextEdicion(existingNums).suggested,
    nombre: '',
    days: []
  }
}

interface EdicionDialogProps {
  ediciones: Edition[]
  dias: EditionDay[]
  lugares: Place[]
  eventos: EventoLookup[]
}

export function EdicionDialog({
  ediciones,
  dias,
  lugares,
  eventos
}: EdicionDialogProps) {
  const isOpen = useEdicionDialog((state) => state.isDialogOpen)
  const selectedEdicionId = useEdicionDialog((state) => state.selectedEdicionId)
  const closeDialog = useEdicionDialog((state) => state.closeDialog)

  const selectedEdicion =
    selectedEdicionId === null
      ? null
      : (ediciones.find((edition) => edition.id === selectedEdicionId) ?? null)

  const isReady = selectedEdicionId === null || selectedEdicion !== null

  return (
    <EntityFormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={selectedEdicionId !== null ? 'Editar edición' : 'Nueva edición'}
      className='sm:max-w-3xl'
    >
      {isOpen && isReady && (
        <EdicionFormContent
          key={selectedEdicionId ?? 'new'}
          initialFormState={computeInitialState(
            selectedEdicion,
            dias,
            ediciones,
            eventos
          )}
          selectedEdicionId={selectedEdicionId}
          selectedEdicion={selectedEdicion}
          eventos={eventos}
          lugares={lugares}
          closeDialog={closeDialog}
        />
      )}
    </EntityFormDialog>
  )
}

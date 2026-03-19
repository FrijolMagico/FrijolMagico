'use client'

import { suggestNextEdicion } from '../../_lib/nomenclature-utils'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import type { EdicionEntry, EdicionDiaEntry, LugarEntry } from '../_types'
import type { EventoEntry } from '../../_types'
import { EdicionFormContent } from './edicion-dialog-form'
import type { EdicionFormState } from '../_types/edition'

function computeInitialState(
  selectedEdicion: EdicionEntry | null,
  dias: EdicionDiaEntry[],
  ediciones: EdicionEntry[],
  eventos: EventoEntry[]
): EdicionFormState {
  if (selectedEdicion) {
    const existingDays = dias
      .filter((d) => d.eventoEdicionId === selectedEdicion.id)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    return {
      eventoId: selectedEdicion.eventoId,
      numeroEdicion: String(selectedEdicion.numeroEdicion),
      nombre: selectedEdicion.nombre ?? '',
      days: existingDays.map((day) => ({
        tempId: crypto.randomUUID(),
        existingId: day.id,
        fecha: day.fecha,
        horaInicio: day.horaInicio,
        horaFin: day.horaFin,
        modalidad: day.modalidad || '',
        lugarId: day.lugarId || ''
      }))
    }
  }

  const existingNums = ediciones.map((e) => String(e.numeroEdicion))
  const defaultEvento = eventos.find(
    (e) => e.nombre === 'Festival Frijol Mágico'
  )

  return {
    eventoId: defaultEvento?.id ?? '',
    numeroEdicion: suggestNextEdicion(existingNums).suggested,
    nombre: '',
    days: []
  }
}

interface EdicionDialogProps {
  ediciones: EdicionEntry[]
  dias: EdicionDiaEntry[]
  lugares: LugarEntry[]
  eventos: EventoEntry[]
}

export function EdicionDialog({
  ediciones,
  dias,
  lugares,
  eventos
}: EdicionDialogProps) {
  const isOpen = useEdicionDialog((s) => s.isDialogOpen)
  const selectedEdicionId = useEdicionDialog((s) => s.selectedEdicionId)
  const closeDialog = useEdicionDialog((s) => s.closeDialog)

  const selectedEdicion = selectedEdicionId
    ? (ediciones.find((e) => e.id === selectedEdicionId) ?? null)
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

'use client'

import { ProjectedEntity } from '@/shared/operations/projection'
import { EdicionDiaEntry, EdicionEntry } from '../_types'
import { NewBaseEntity } from '@/shared/operations/types'
import { EventoEntry } from '../../_types'
import { useDialogFormState } from '@/shared/hooks/use-dialog-form-state'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { PosterSection } from './poster-section'
import { DayFormState, EdicionFormState, FormErrors } from '../_types/edition'
import { edicionFormSchema } from '../_schemas/edicion.schema'
import { useEdicionOperationStore } from '../_store/edicion-ui-store'
import { useLugarProjectionStore } from '../_store/lugar-ui-store'
import { generateEdicionSlug } from '../../_lib/slug-utils'
import { Plus } from 'lucide-react'
import { EdicionDaysTable } from './edicion-days-table'
import { EdicionDayDialog } from './edicion-day-dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { PosterPreview } from './poster-preview'
import { toast } from 'sonner'

const INITIAL_ERRORS: FormErrors = {
  eventoId: null,
  numeroEdicion: null,
  days: {}
}

type ModalidadValue = 'presencial' | 'online' | 'hibrido'

interface EdicionFormContentProps {
  initialFormState: EdicionFormState
  selectedEdicionId: string | null
  selectedEdicion: ProjectedEntity<EdicionEntry> | null
  eventoById: Record<string, ProjectedEntity<EventoEntry>>
  eventoIds: string[]
  closeDialog: () => void
  addEdicion: (data: NewBaseEntity<EdicionEntry>) => void
  updateEdicion: (id: string, data: Partial<EdicionEntry>) => void
  addDia: (data: NewBaseEntity<EdicionDiaEntry>) => void
  updateDia: (id: string, data: Partial<EdicionDiaEntry>) => void
  removeDia: (id: string) => void
  diaById: Record<string, ProjectedEntity<EdicionDiaEntry>>
}

export function EdicionFormContent({
  initialFormState,
  selectedEdicionId,
  selectedEdicion,
  eventoById,
  eventoIds,
  closeDialog,
  addEdicion,
  updateEdicion,
  addDia,
  updateDia,
  removeDia,
  diaById
}: EdicionFormContentProps) {
  const { formState, setField, setFormState } =
    useDialogFormState<EdicionFormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)

  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<DayFormState | null>(null)
  const [dayDialogKey, setDayDialogKey] = useState(0)
  const [isPosterPreviewOpen, setIsPosterPreviewOpen] = useState(false)

  const handlePosterUpload = () => {
    if (!selectedEdicionId) {
      toast.info('Guarda la edición primero para agregar poster')
      return
    }
    console.warn(
      '[EdicionFormContent] TODO: CDN poster upload not implemented',
      { selectedEdicionId }
    )
  }

  const handlePosterDelete = () => {
    if (!selectedEdicionId) return
    console.warn(
      '[EdicionFormContent] TODO: CDN poster delete not implemented',
      { selectedEdicionId }
    )
  }

  const lugarById = useLugarProjectionStore((s) => s.byId)
  const lugarNombreById: Record<string, string> = Object.fromEntries(
    Object.entries(lugarById)
      .filter(([, lugar]) => !lugar.__meta?.isDeleted)
      .map(([id, lugar]) => [id, lugar.nombre])
  )

  const openAddDayDialog = () => {
    setEditingDay(null)
    setDayDialogKey((k) => k + 1)
    setIsDayDialogOpen(true)
  }

  const openEditDayDialog = (tempId: string) => {
    const day = formState.days.find((d) => d.tempId === tempId) ?? null
    setEditingDay(day)
    setDayDialogKey((k) => k + 1)
    setIsDayDialogOpen(true)
  }

  const removeDayFromForm = (tempId: string) => {
    setFormState((prev) => ({
      ...prev,
      days: prev.days.filter((day) => day.tempId !== tempId)
    }))
    setErrors((prev) => {
      const nextDays = { ...prev.days }
      delete nextDays[tempId]
      return { ...prev, days: nextDays }
    })
  }

  const handleDaySave = (day: DayFormState) => {
    setFormState((prev) => {
      const existingIdx = prev.days.findIndex((d) => d.tempId === day.tempId)
      if (existingIdx >= 0) {
        const nextDays = [...prev.days]
        nextDays[existingIdx] = day
        return { ...prev, days: nextDays }
      }
      return { ...prev, days: [...prev.days, day] }
    })
  }

  const validateForm = (): boolean => {
    const trimmedNumeroEdicion = formState.numeroEdicion.trim()
    const trimmedNombre = formState.nombre.trim()

    const parseResult = edicionFormSchema.safeParse({
      eventoId: formState.eventoId,
      numeroEdicion: trimmedNumeroEdicion,
      nombre: trimmedNombre
    })

    const nextErrors: FormErrors = INITIAL_ERRORS

    if (!formState.eventoId.trim()) {
      nextErrors.eventoId = 'El evento es obligatorio'
    }

    if (!trimmedNumeroEdicion) {
      nextErrors.numeroEdicion = 'El número de edición es obligatorio'
    }

    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        if (issue.path[0] === 'eventoId') {
          nextErrors.eventoId = issue.message
        }
        if (issue.path[0] === 'numeroEdicion') {
          nextErrors.numeroEdicion = issue.message
        }
      }
    }

    setErrors(nextErrors)

    return (
      !nextErrors.eventoId &&
      !nextErrors.numeroEdicion &&
      Object.keys(nextErrors.days).length === 0
    )
  }

  const handleApply = () => {
    if (!validateForm()) return

    const now = new Date().toISOString()
    const payload = {
      eventoId: formState.eventoId,
      numeroEdicion: formState.numeroEdicion.trim(),
      nombre: formState.nombre.trim() || null
    }

    if (!selectedEdicionId) {
      const previousOperations =
        useEdicionOperationStore.getState().operations ?? []

      addEdicion({
        ...payload,
        slug: generateEdicionSlug(payload.numeroEdicion),
        posterUrl: null,
        createdAt: now,
        updatedAt: now
      })

      const nextOperations =
        useEdicionOperationStore.getState().operations ?? []
      const latestOperation = nextOperations[nextOperations.length - 1]

      const createdEdicionId =
        latestOperation?.type === 'ADD' &&
        nextOperations.length > previousOperations.length
          ? latestOperation.id
          : null

      if (!createdEdicionId) return

      for (const day of formState.days) {
        addDia({
          eventoEdicionId: createdEdicionId,
          fecha: day.fecha,
          horaInicio: day.horaInicio,
          horaFin: day.horaFin,
          modalidad: day.modalidad as ModalidadValue,
          lugarId: day.lugarId,
          createdAt: now,
          updatedAt: now
        })
      }

      closeDialog()
      return
    }

    updateEdicion(selectedEdicionId, payload)

    const persistedDays = Object.values(diaById).filter(
      (day) =>
        day.eventoEdicionId === selectedEdicionId && !day.__meta?.isDeleted
    )

    const persistedDaysById = new Map(
      persistedDays.map((day) => [day.id, day] as const)
    )

    const formExistingIds = new Set(
      formState.days.map((day) => day.existingId).filter(Boolean)
    )

    for (const day of formState.days) {
      const dayPayload = {
        eventoEdicionId: selectedEdicionId,
        fecha: day.fecha,
        horaInicio: day.horaInicio,
        horaFin: day.horaFin,
        modalidad: day.modalidad as ModalidadValue,
        lugarId: day.lugarId,
        updatedAt: now
      }

      if (!day.existingId) {
        addDia({ ...dayPayload, createdAt: now })
        continue
      }

      const existingDay = persistedDaysById.get(day.existingId)
      if (!existingDay) {
        addDia({ ...dayPayload, createdAt: now })
        continue
      }

      const didChange =
        existingDay.fecha !== dayPayload.fecha ||
        existingDay.horaInicio !== dayPayload.horaInicio ||
        existingDay.horaFin !== dayPayload.horaFin ||
        existingDay.modalidad !== dayPayload.modalidad ||
        (existingDay.lugarId ?? null) !== dayPayload.lugarId

      if (didChange) {
        updateDia(day.existingId, dayPayload)
      }
    }

    for (const existingDay of persistedDays) {
      if (!formExistingIds.has(existingDay.id)) {
        removeDia(existingDay.id)
      }
    }

    closeDialog()
  }

  const selectedEventoNombre = formState.eventoId
    ? eventoById[formState.eventoId]?.nombre
    : null

  return (
    <div className='space-y-6 py-2'>
      <FieldGroup className='flex flex-col sm:flex-row'>
        <Field>
          <FieldLabel htmlFor='edicion-evento'>Evento</FieldLabel>
          <Select
            value={formState.eventoId || null}
            onValueChange={(value) => {
              setField('eventoId', value ?? '')
              setErrors((prev) => ({ ...prev, eventoId: null }))
            }}
          >
            <SelectTrigger id='edicion-evento'>
              <SelectValue placeholder='Seleccionar evento...'>
                {selectedEventoNombre}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {eventoIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {eventoById[id]?.nombre ?? id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.eventoId && <FieldError>{errors.eventoId}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor='edicion-numero'>Número de edición</FieldLabel>
          <Input
            id='edicion-numero'
            value={formState.numeroEdicion}
            onChange={(e) => {
              setField('numeroEdicion', e.target.value)
              setErrors((prev) => ({ ...prev, numeroEdicion: null }))
            }}
            placeholder='Ej. 5 o V'
          />
          {errors.numeroEdicion && (
            <FieldError>{errors.numeroEdicion}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='edicion-nombre'>Nombre (opcional)</FieldLabel>
          <Input
            id='edicion-nombre'
            value={formState.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
            placeholder='Ej. Edición aniversario'
          />
        </Field>
      </FieldGroup>

      <Field className='space-y-2'>
        <FieldLabel>Poster</FieldLabel>
        <PosterSection
          posterUrl={selectedEdicion?.posterUrl ?? null}
          alt={
            selectedEdicion?.nombre ??
            selectedEdicion?.numeroEdicion ??
            'Poster'
          }
          onClick={() => setIsPosterPreviewOpen(true)}
        />
        <PosterPreview
          isOpen={isPosterPreviewOpen}
          posterUrl={selectedEdicion?.posterUrl ?? null}
          alt={selectedEdicion?.nombre ?? 'Poster'}
          onClose={() => setIsPosterPreviewOpen(false)}
          onUpload={handlePosterUpload}
          onDelete={handlePosterDelete}
        />
      </Field>

      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Días</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={openAddDayDialog}
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar día
          </Button>
        </div>

        <EdicionDaysTable
          days={formState.days}
          lugarNombreById={lugarNombreById}
          onEdit={openEditDayDialog}
          onDelete={removeDayFromForm}
        />
      </section>

      <div className='flex justify-end gap-2 border-t pt-4'>
        <Button type='button' variant='outline' onClick={closeDialog}>
          Cancelar
        </Button>
        <Button type='button' onClick={handleApply}>
          {selectedEdicionId ? 'Guardar cambios' : 'Crear edición'}
        </Button>
      </div>

      <EdicionDayDialog
        key={dayDialogKey}
        open={isDayDialogOpen}
        onClose={() => setIsDayDialogOpen(false)}
        initialDay={editingDay}
        onSave={handleDaySave}
      />
    </div>
  )
}

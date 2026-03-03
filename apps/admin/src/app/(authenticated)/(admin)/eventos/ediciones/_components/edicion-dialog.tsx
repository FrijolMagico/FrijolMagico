'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { suggestNextEdicion } from '../../_lib/nomenclature-utils'
import { generateEdicionSlug } from '../../_lib/slug-utils'
import { useEventoProjectionStore } from '../../_store/evento-ui-store'
import { edicionFormSchema } from '../_schemas/edicion.schema'
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
import { LugarCombobox } from './lugar-combobox'

const MODALIDAD_VALUES = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online',
  HIBRIDO: 'hibrido'
} as const

type ModalidadValue = (typeof MODALIDAD_VALUES)[keyof typeof MODALIDAD_VALUES]

interface DayFormState {
  tempId: string
  fecha: string
  horaInicio: string
  horaFin: string
  modalidad: ModalidadValue | ''
  lugarId: string | null
  existingId?: string
}

interface EdicionFormState {
  eventoId: string
  numeroEdicion: string
  nombre: string
  days: DayFormState[]
}

interface DayFieldErrors {
  fecha?: string
  horaInicio?: string
  horaFin?: string
  modalidad?: string
}

interface FormErrors {
  eventoId?: string
  numeroEdicion?: string
  days: Record<string, DayFieldErrors>
}

const INITIAL_FORM_STATE: EdicionFormState = {
  eventoId: '',
  numeroEdicion: '',
  nombre: '',
  days: []
}

const INITIAL_ERRORS: FormErrors = {
  days: {}
}

function createEmptyDay(): DayFormState {
  return {
    tempId: crypto.randomUUID(),
    fecha: '',
    horaInicio: '',
    horaFin: '',
    modalidad: '',
    lugarId: null
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

  const [formState, setFormState] = useState<EdicionFormState>(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)

  const selectedEdicion = selectedEdicionId ? edicionById[selectedEdicionId] : null

  useEffect(() => {
    if (!isOpen) return

    if (selectedEdicionId && selectedEdicion) {
      const existingDays = Object.values(diaById)
        .filter(
          (day) =>
            day.eventoEdicionId === selectedEdicionId && !day.__meta?.isDeleted
        )
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

      setFormState({
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
      })
      setErrors(INITIAL_ERRORS)
      return
    }

    const existingEditionNumbers = edicionIds
      .map((id) => edicionById[id])
      .filter((edicion) => !!edicion && !edicion.__meta?.isDeleted)
      .map((edicion) => edicion.numeroEdicion)

    const suggestion = suggestNextEdicion(existingEditionNumbers)

    setFormState({
      eventoId: '',
      numeroEdicion: suggestion.suggested,
      nombre: '',
      days: []
    })
    setErrors(INITIAL_ERRORS)
  }, [
    isOpen,
    selectedEdicionId,
    selectedEdicion,
    diaById,
    edicionIds,
    edicionById
  ])

  const setField = <K extends keyof EdicionFormState>(
    key: K,
    value: EdicionFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const setDayField = <K extends keyof DayFormState>(
    tempId: string,
    key: K,
    value: DayFormState[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.tempId === tempId ? { ...day, [key]: value } : day
      )
    }))
  }

  const addDay = () => {
    setFormState((prev) => ({
      ...prev,
      days: [...prev.days, createEmptyDay()]
    }))
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

  const validateForm = (): boolean => {
    const trimmedNumeroEdicion = formState.numeroEdicion.trim()
    const trimmedNombre = formState.nombre.trim()

    const parseResult = edicionFormSchema.safeParse({
      eventoId: Number(formState.eventoId),
      numeroEdicion: trimmedNumeroEdicion,
      nombre: trimmedNombre || undefined
    })

    const nextErrors: FormErrors = { days: {} }

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

    for (const day of formState.days) {
      const dayErrors: DayFieldErrors = {}

      if (!day.fecha) {
        dayErrors.fecha = 'La fecha es obligatoria'
      }
      if (!day.horaInicio) {
        dayErrors.horaInicio = 'La hora de inicio es obligatoria'
      }
      if (!day.horaFin) {
        dayErrors.horaFin = 'La hora de fin es obligatoria'
      }
      if (!day.modalidad) {
        dayErrors.modalidad = 'La modalidad es obligatoria'
      }

      if (Object.keys(dayErrors).length > 0) {
        nextErrors.days[day.tempId] = dayErrors
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
      eventoId: String(Number(formState.eventoId)),
      numeroEdicion: formState.numeroEdicion.trim(),
      nombre: formState.nombre.trim() || null
    }

    if (!selectedEdicionId) {
      const previousOperations = useEdicionOperationStore.getState().operations ?? []

      addEdicion({
        ...payload,
        slug: generateEdicionSlug(payload.numeroEdicion),
        posterUrl: null,
        createdAt: now,
        updatedAt: now
      })

      const nextOperations = useEdicionOperationStore.getState().operations ?? []
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

  return (
    <EntityFormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={selectedEdicionId ? 'Editar edición' : 'Nueva edición'}
      className='max-w-2xl'
    >
      {isOpen && (
        <div className='space-y-6 py-2'>
          <section className='space-y-2'>
            <Label htmlFor='edicion-evento'>Evento</Label>
            <Select
              value={formState.eventoId || undefined}
              onValueChange={(value) => {
                setField('eventoId', value ?? '')
                setErrors((prev) => ({ ...prev, eventoId: undefined }))
              }}
            >
              <SelectTrigger id='edicion-evento'>
                <SelectValue placeholder='Seleccionar evento...' />
              </SelectTrigger>
              <SelectContent>
                {eventoIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {eventoById[id]?.nombre ?? id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventoId && (
              <p className='text-destructive text-xs'>{errors.eventoId}</p>
            )}
          </section>

          <section className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='edicion-numero'>Número de edición</Label>
              <Input
                id='edicion-numero'
                value={formState.numeroEdicion}
                onChange={(e) => {
                  setField('numeroEdicion', e.target.value)
                  setErrors((prev) => ({ ...prev, numeroEdicion: undefined }))
                }}
                placeholder='Ej. 5 o V'
              />
              {errors.numeroEdicion && (
                <p className='text-destructive text-xs'>{errors.numeroEdicion}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edicion-nombre'>Nombre (opcional)</Label>
              <Input
                id='edicion-nombre'
                value={formState.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                placeholder='Ej. Edición aniversario'
              />
            </div>
          </section>

          {selectedEdicionId && selectedEdicion?.posterUrl && (
            <section className='space-y-2'>
              <Label>Poster</Label>
              <PosterSection
                posterUrl={selectedEdicion.posterUrl}
                alt={selectedEdicion.nombre ?? selectedEdicion.numeroEdicion}
              />
            </section>
          )}

          <section className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Días</Label>
              <Button type='button' variant='outline' size='sm' onClick={addDay}>
                <Plus className='mr-2 h-4 w-4' />
                Agregar día
              </Button>
            </div>

            {formState.days.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                Aún no hay días agregados para esta edición.
              </p>
            ) : (
              <div className='space-y-3'>
                {formState.days.map((day, index) => {
                  const dayErrors = errors.days[day.tempId] ?? {}

                  return (
                    <div
                      key={day.tempId}
                      className='space-y-3 rounded-md border p-3'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>Día {index + 1}</p>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='text-destructive hover:text-destructive'
                          onClick={() => removeDayFromForm(day.tempId)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Quitar
                        </Button>
                      </div>

                      <div className='grid gap-3 sm:grid-cols-2'>
                        <div className='space-y-1'>
                          <Label htmlFor={`dia-fecha-${day.tempId}`}>Fecha</Label>
                          <Input
                            id={`dia-fecha-${day.tempId}`}
                            type='date'
                            value={day.fecha}
                            onChange={(e) =>
                              setDayField(day.tempId, 'fecha', e.target.value)
                            }
                          />
                          {dayErrors.fecha && (
                            <p className='text-destructive text-xs'>
                              {dayErrors.fecha}
                            </p>
                          )}
                        </div>

                        <div className='space-y-1'>
                          <Label htmlFor={`dia-modalidad-${day.tempId}`}>
                            Modalidad
                          </Label>
                          <Select
                            value={day.modalidad || undefined}
                            onValueChange={(value) =>
                              setDayField(
                                day.tempId,
                                'modalidad',
                                value as ModalidadValue
                              )
                            }
                          >
                            <SelectTrigger id={`dia-modalidad-${day.tempId}`}>
                              <SelectValue placeholder='Seleccionar modalidad...' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={MODALIDAD_VALUES.PRESENCIAL}>
                                Presencial
                              </SelectItem>
                              <SelectItem value={MODALIDAD_VALUES.ONLINE}>
                                Online
                              </SelectItem>
                              <SelectItem value={MODALIDAD_VALUES.HIBRIDO}>
                                Híbrido
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {dayErrors.modalidad && (
                            <p className='text-destructive text-xs'>
                              {dayErrors.modalidad}
                            </p>
                          )}
                        </div>

                        <div className='space-y-1'>
                          <Label htmlFor={`dia-hora-inicio-${day.tempId}`}>
                            Hora inicio
                          </Label>
                          <Input
                            id={`dia-hora-inicio-${day.tempId}`}
                            type='time'
                            value={day.horaInicio}
                            onChange={(e) =>
                              setDayField(day.tempId, 'horaInicio', e.target.value)
                            }
                          />
                          {dayErrors.horaInicio && (
                            <p className='text-destructive text-xs'>
                              {dayErrors.horaInicio}
                            </p>
                          )}
                        </div>

                        <div className='space-y-1'>
                          <Label htmlFor={`dia-hora-fin-${day.tempId}`}>
                            Hora fin
                          </Label>
                          <Input
                            id={`dia-hora-fin-${day.tempId}`}
                            type='time'
                            value={day.horaFin}
                            onChange={(e) =>
                              setDayField(day.tempId, 'horaFin', e.target.value)
                            }
                          />
                          {dayErrors.horaFin && (
                            <p className='text-destructive text-xs'>
                              {dayErrors.horaFin}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <Label>Lugar</Label>
                        <LugarCombobox
                          value={day.lugarId}
                          onChange={(value) =>
                            setDayField(day.tempId, 'lugarId', value)
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className='flex justify-end gap-2 border-t pt-4'>
            <Button type='button' variant='outline' onClick={closeDialog}>
              Cancelar
            </Button>
            <Button type='button' onClick={handleApply}>
              {selectedEdicionId ? 'Guardar cambios' : 'Crear edición'}
            </Button>
          </div>
        </div>
      )}
    </EntityFormDialog>
  )
}

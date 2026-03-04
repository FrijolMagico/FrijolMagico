'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { DatePickerField } from './date-picker-field'
import { LugarCombobox } from './lugar-combobox'
import { TimePickerField } from './time-picker-field'
import type { DayFieldErrors, DayFormState } from '../_types/edition'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'

const MODALIDAD_VALUES = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online',
  HIBRIDO: 'hibrido'
} as const

type ModalidadValue = (typeof MODALIDAD_VALUES)[keyof typeof MODALIDAD_VALUES]

const MODALIDAD_LABELS: Record<ModalidadValue, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido'
}

function createEmptyDayState(): DayFormState {
  return {
    tempId: crypto.randomUUID(),
    fecha: '',
    horaInicio: '',
    horaFin: '',
    modalidad: '',
    lugarId: null
  }
}

function validateDay(day: DayFormState): DayFieldErrors {
  const errors: DayFieldErrors = {}
  if (!day.fecha) errors.fecha = 'La fecha es obligatoria'
  if (!day.horaInicio) errors.horaInicio = 'La hora de inicio es obligatoria'
  if (!day.horaFin) errors.horaFin = 'La hora de fin es obligatoria'
  if (!day.modalidad) errors.modalidad = 'La modalidad es obligatoria'
  return errors
}

interface EdicionDayDialogProps {
  open: boolean
  onClose: () => void
  initialDay: DayFormState | null
  onSave: (day: DayFormState) => void
}

export function EdicionDayDialog({
  open,
  onClose,
  initialDay,
  onSave
}: EdicionDayDialogProps) {
  const [day, setDay] = useState<DayFormState>(
    () => initialDay ?? createEmptyDayState()
  )
  const [errors, setErrors] = useState<DayFieldErrors>({})

  const setDayField = <K extends keyof DayFormState>(
    key: K,
    value: DayFormState[K]
  ) => {
    setDay((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose()
  }

  const handleSave = () => {
    const dayErrors = validateDay(day)
    if (Object.keys(dayErrors).length > 0) {
      setErrors(dayErrors)
      return
    }
    onSave(day)
    onClose()
  }

  const isEditing = !!initialDay

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar día' : 'Agregar día'}</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <FieldGroup className='grid sm:grid-cols-2'>
            <DatePickerField
              id='dia-fecha'
              label='Fecha'
              value={day.fecha}
              onChange={(value) => setDayField('fecha', value)}
              error={errors.fecha}
            />

            <Field>
              <FieldLabel htmlFor='dia-modalidad'>Modalidad</FieldLabel>
              <Select
                value={day.modalidad}
                onValueChange={(value) =>
                  setDayField('modalidad', value as ModalidadValue)
                }
              >
                <SelectTrigger id='dia-modalidad'>
                  <SelectValue placeholder='Seleccionar modalidad'>
                    {day.modalidad
                      ? MODALIDAD_LABELS[day.modalidad as ModalidadValue]
                      : null}
                  </SelectValue>
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
              {errors.modalidad && <FieldError>{errors.modalidad}</FieldError>}
            </Field>
          </FieldGroup>

          <FieldGroup className='grid sm:grid-cols-2'>
            <TimePickerField
              id='dia-hora-inicio'
              label='Hora inicio'
              value={day.horaInicio}
              onChange={(value) => setDayField('horaInicio', value)}
              error={errors.horaInicio}
            />

            <TimePickerField
              id='dia-hora-fin'
              label='Hora fin'
              value={day.horaFin}
              onChange={(value) => setDayField('horaFin', value)}
              error={errors.horaFin}
            />
          </FieldGroup>

          <Field>
            <FieldLabel>Lugar</FieldLabel>
            <LugarCombobox
              value={day.lugarId}
              onChange={(value) => setDayField('lugarId', value)}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleSave}>
            {isEditing ? 'Guardar cambios' : 'Agregar día'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

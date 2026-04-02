'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import type { DayFormStateInput } from '../_schemas/edition-day.schema'
import { dayFormStateSchema } from '../_schemas/edition-day.schema'
import type { Place } from '../_schemas/place.schema'
import { DatePickerField } from '@/shared/components/date-picker-field'
import { TimePickerField } from '@/shared/components/time-picker-field'
import { LugarCombobox } from './place-combobox'

const MODALIDAD_LABELS = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido'
} as const

function createEmptyDayState(): DayFormStateInput {
  return {
    tempId: crypto.randomUUID(),
    fecha: '',
    horaInicio: '',
    horaFin: '',
    modalidad: null,
    lugarId: null
  }
}

interface EdicionDayDialogProps {
  open: boolean
  onClose: () => void
  initialDay: DayFormStateInput | null
  onSave: (day: DayFormStateInput) => void
  lugares: Place[]
}

export function EdicionDayDialog({
  open,
  onClose,
  initialDay,
  onSave,
  lugares
}: EdicionDayDialogProps) {
  const methods = useForm<DayFormStateInput>({
    resolver: zodResolver(dayFormStateSchema),
    values: initialDay ?? createEmptyDayState(),
    mode: 'onChange'
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = methods

  const handleDialogClose = () => {
    onClose()
    reset(initialDay ?? createEmptyDayState())
  }

  const onSubmit = (data: DayFormStateInput) => {
    onSave(data)
    handleDialogClose()
    reset(createEmptyDayState())
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleDialogClose()}
    >
      <DialogContent className='max-w-md'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {initialDay?.existingId ? 'Editar día' : 'Agregar día'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <Controller
              name='fecha'
              control={control}
              render={({ field }) => (
                <DatePickerField
                  id='dia-fecha'
                  label='Fecha'
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.fecha?.message}
                />
              )}
            />

            <FieldGroup className='grid grid-cols-2 gap-4'>
              <Controller
                name='horaInicio'
                control={control}
                render={({ field }) => (
                  <TimePickerField
                    id='dia-hora-inicio'
                    label='Hora inicio'
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.horaInicio?.message}
                  />
                )}
              />

              <Controller
                name='horaFin'
                control={control}
                render={({ field }) => (
                  <TimePickerField
                    id='dia-hora-fin'
                    label='Hora fin'
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.horaFin?.message}
                  />
                )}
              />
            </FieldGroup>

            <Field>
              <FieldLabel htmlFor='dia-modalidad'>Modalidad</FieldLabel>
              <Controller
                name='modalidad'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(value) =>
                      field.onChange(
                        value as NonNullable<DayFormStateInput['modalidad']>
                      )
                    }
                  >
                    <SelectTrigger id='dia-modalidad'>
                      <SelectValue placeholder='Seleccionar...' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODALIDAD_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.modalidad && (
                <FieldError>{errors.modalidad.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel>Lugar</FieldLabel>
              <Controller
                name='lugarId'
                control={control}
                render={({ field }) => (
                  <LugarCombobox
                    value={field.value}
                    onChange={field.onChange}
                    lugares={lugares}
                  />
                )}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleDialogClose}>
              Cancelar
            </Button>
            <Button type='submit'>
              {initialDay?.existingId ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

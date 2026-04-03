'use client'

import { IconPlus } from '@tabler/icons-react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useState } from 'react'
import type { DayFormStateInput } from '../_schemas/edition-day.schema'
import type {
  EditionWithDays,
  EdicionRootFormInput
} from '../_schemas/edition-composite.schema'
import type { Place } from '../_schemas/place.schema'
import type { EventoLookup } from '../_types'
import { EdicionDayDialog as EditionDayDialog } from './edition-day-dialog'
import { EdicionDaysTable as EditionDaysTable } from './edition-days-table'
import { PosterPreview } from './poster-preview'
import { PosterSection } from './poster-section'
import { Button } from '@/shared/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'

interface EditionFormLayoutProps {
  mode: 'create' | 'update'
  eventos: EventoLookup[]
  lugares: Place[]
  selectedEdition?: EditionWithDays | null
}

export function EditionFormLayout({
  mode,
  eventos,
  lugares,
  selectedEdition
}: EditionFormLayoutProps) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<EdicionRootFormInput>()
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'days'
  })
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<DayFormStateInput | null>(null)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
  const [dayDialogKey, setDayDialogKey] = useState(0)
  const [isPosterPreviewOpen, setIsPosterPreviewOpen] = useState(false)

  const lugarNombreById = new Map(
    lugares.map((lugar) => [lugar.id, lugar.nombre] as const)
  )

  const openAddDayDialog = () => {
    setEditingDay(null)
    setEditingDayIndex(null)
    setDayDialogKey((current) => current + 1)
    setIsDayDialogOpen(true)
  }

  const openEditDayDialog = (tempId: string) => {
    const index = fields.findIndex((day) => day.tempId === tempId)
    const day = index >= 0 ? fields[index] : null

    setEditingDay(day ?? null)
    setEditingDayIndex(index >= 0 ? index : null)
    setDayDialogKey((current) => current + 1)
    setIsDayDialogOpen(true)
  }

  const removeDayFromForm = (tempId: string) => {
    const index = fields.findIndex((day) => day.tempId === tempId)

    if (index >= 0) {
      remove(index)
    }
  }

  const handleDaySave = (day: DayFormStateInput) => {
    if (editingDayIndex !== null) {
      update(editingDayIndex, day)
      return
    }

    append(day)
  }

  const handlePosterUpload = () => {
    if (!selectedEdition?.id) {
      return
    }

    console.warn(
      '[EditionFormLayout] TODO: CDN poster upload not implemented',
      {
        selectedEditionId: selectedEdition.id
      }
    )
  }

  const handlePosterDelete = () => {
    if (!selectedEdition?.id) {
      return
    }

    console.warn(
      '[EditionFormLayout] TODO: CDN poster delete not implemented',
      {
        selectedEditionId: selectedEdition.id
      }
    )
  }

  return (
    <div className='space-y-6 py-2'>
      <FieldGroup className='flex flex-col sm:flex-row'>
        <Field>
          <FieldLabel htmlFor='edicion-evento'>Evento</FieldLabel>
          <Controller
            name='eventoId'
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id='edicion-evento'>
                  <SelectValue placeholder='Seleccionar evento...'>
                    {
                      eventos.find((evento) => evento.id === field.value)
                        ?.nombre
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eventos.map((evento) => (
                    <SelectItem key={evento.id} value={String(evento.id)}>
                      {evento.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.eventoId && (
            <FieldError>{errors.eventoId.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='edicion-numero'>Número de edición</FieldLabel>
          <Input
            id='edicion-numero'
            {...register('numeroEdicion')}
            placeholder='Ej. 5 o V'
            aria-invalid={!!errors.numeroEdicion}
          />
          {errors.numeroEdicion && (
            <FieldError>{errors.numeroEdicion.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='edicion-nombre'>Nombre (opcional)</FieldLabel>
          <Input
            id='edicion-nombre'
            {...register('nombre')}
            placeholder='Ej. Edición aniversario'
            aria-invalid={!!errors.nombre}
          />
          {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
        </Field>
      </FieldGroup>

      {mode === 'update' && (
        <Field className='space-y-2'>
          <FieldLabel>Poster</FieldLabel>
          <PosterSection
            posterUrl={selectedEdition?.posterUrl ?? null}
            alt={
              selectedEdition?.nombre ??
              selectedEdition?.numeroEdicion ??
              'Poster'
            }
            onClick={() => setIsPosterPreviewOpen(true)}
          />
          <PosterPreview
            isOpen={isPosterPreviewOpen}
            posterUrl={selectedEdition?.posterUrl ?? null}
            alt={selectedEdition?.nombre ?? 'Poster'}
            onClose={() => setIsPosterPreviewOpen(false)}
            onUpload={handlePosterUpload}
            onDelete={handlePosterDelete}
          />
        </Field>
      )}

      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Días</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={openAddDayDialog}
          >
            <IconPlus className='mr-2 h-4 w-4' />
            Agregar día
          </Button>
        </div>

        <EditionDaysTable
          days={fields}
          lugarNombreById={lugarNombreById}
          onEdit={openEditDayDialog}
          onDelete={removeDayFromForm}
        />
      </section>

      <EditionDayDialog
        key={dayDialogKey}
        open={isDayDialogOpen}
        onClose={() => setIsDayDialogOpen(false)}
        initialDay={editingDay}
        onSave={handleDaySave}
        lugares={lugares}
      />
    </div>
  )
}

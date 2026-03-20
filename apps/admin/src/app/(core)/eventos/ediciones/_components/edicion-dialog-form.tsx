'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { saveEdicionWithDaysAction } from '../_actions/save-edicion-with-days.action'
import {
  edicionRootFormSchema,
  type Edition,
  type EdicionRootFormInput,
  type Place
} from '../_schemas/edicion.schema'
import type { DayFormState } from '../_types/edition'
import type { EventoLookup } from '../_types'
import { EdicionDayDialog } from './edicion-day-dialog'
import { EdicionDaysTable } from './edicion-days-table'
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

interface EdicionFormContentProps {
  initialFormState: {
    eventoId: number | null
    numeroEdicion: string
    nombre: string
    days: DayFormState[]
  }
  selectedEdicionId: number | null
  selectedEdicion: Edition | null
  eventos: EventoLookup[]
  lugares: Place[]
  closeDialog: () => void
}

export function EdicionFormContent({
  initialFormState,
  selectedEdicionId,
  selectedEdicion,
  eventos,
  lugares,
  closeDialog
}: EdicionFormContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<DayFormState | null>(null)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
  const [dayDialogKey, setDayDialogKey] = useState(0)
  const [isPosterPreviewOpen, setIsPosterPreviewOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid }
  } = useForm<EdicionRootFormInput>({
    resolver: zodResolver(edicionRootFormSchema),
    defaultValues: {
      eventoId: initialFormState.eventoId ?? undefined,
      numeroEdicion: initialFormState.numeroEdicion,
      nombre: initialFormState.nombre,
      days: initialFormState.days
    }
  })

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'days'
  })

  const handlePosterUpload = () => {
    if (selectedEdicionId === null) {
      toast.info('Guarda la edición primero para agregar poster')
      return
    }

    console.warn(
      '[EdicionFormContent] TODO: CDN poster upload not implemented',
      {
        selectedEdicionId
      }
    )
  }

  const handlePosterDelete = () => {
    if (selectedEdicionId === null) return

    console.warn(
      '[EdicionFormContent] TODO: CDN poster delete not implemented',
      {
        selectedEdicionId
      }
    )
  }

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
    if (index >= 0) remove(index)
  }

  const handleDaySave = (day: DayFormState) => {
    if (editingDayIndex !== null) {
      update(editingDayIndex, day)
      return
    }

    append(day)
  }

  const onSubmit = (rootFields: EdicionRootFormInput) => {
    if (rootFields.eventoId === undefined || rootFields.eventoId === null) {
      toast.error('El evento es obligatorio')
      return
    }

    const payload = {
      id: selectedEdicionId,
      eventoId: rootFields.eventoId,
      numeroEdicion: rootFields.numeroEdicion.trim(),
      nombre: rootFields.nombre?.trim() || null,
      posterUrl: selectedEdicion?.posterUrl ?? null,
      days: rootFields.days
    }

    startTransition(async () => {
      const result = await saveEdicionWithDaysAction(
        { success: false },
        payload
      )

      if (!result.success && result.errors) {
        toast.error(result.errors[0]?.message ?? 'Error al guardar la edición')
        return
      }

      toast.success(
        selectedEdicionId !== null ? 'Edición actualizada' : 'Edición creada'
      )
      closeDialog()
      router.refresh()
    })
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
                value={field.value ?? undefined}
                onValueChange={field.onChange}
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
                    <SelectItem key={evento.id} value={evento.id}>
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
            <IconPlus className='mr-2 h-4 w-4' />
            Agregar día
          </Button>
        </div>

        <EdicionDaysTable
          days={fields}
          lugarNombreById={lugarNombreById}
          onEdit={openEditDayDialog}
          onDelete={removeDayFromForm}
        />
      </section>

      <div className='flex justify-end gap-2 border-t pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={closeDialog}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type='button'
          onClick={handleSubmit(onSubmit)}
          disabled={
            isPending || (!isDirty && selectedEdicionId !== null) || !isValid
          }
        >
          {isPending
            ? 'Guardando...'
            : selectedEdicionId !== null
              ? 'Guardar cambios'
              : 'Crear edición'}
        </Button>
      </div>

      <EdicionDayDialog
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

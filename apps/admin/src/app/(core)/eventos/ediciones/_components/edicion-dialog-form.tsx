'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import type { EdicionEntry, LugarEntry } from '../_types'
import type { EventoEntry } from '../../_types'
import type { DayFormState } from '../_types/edition'
import {
  edicionRootFormSchema,
  type EdicionRootFormInput
} from '../_schemas/edicion.schema'
import { IconPlus } from '@tabler/icons-react'
import { EdicionDaysTable } from './edicion-days-table'
import { EdicionDayDialog } from './edicion-day-dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { PosterPreview } from './poster-preview'
import { saveEdicionWithDaysAction } from '../_actions/save-edicion-with-days.action'

interface EdicionFormContentProps {
  initialFormState: {
    eventoId: string
    numeroEdicion: string
    nombre: string
    days: DayFormState[]
  }
  selectedEdicionId: string | null
  selectedEdicion: EdicionEntry | null
  eventos: EventoEntry[]
  lugares: LugarEntry[]
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid }
  } = useForm<EdicionRootFormInput>({
    resolver: zodResolver(edicionRootFormSchema),
    defaultValues: {
      eventoId: initialFormState.eventoId,
      numeroEdicion: initialFormState.numeroEdicion,
      nombre: initialFormState.nombre ?? '',
      days: initialFormState.days
    }
  })

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'days'
  })

  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<DayFormState | null>(null)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
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

  const lugarNombreById: Record<string, string> = Object.fromEntries(
    lugares.map((l) => [l.id, l.nombre])
  )

  const openAddDayDialog = () => {
    setEditingDay(null)
    setEditingDayIndex(null)
    setDayDialogKey((k) => k + 1)
    setIsDayDialogOpen(true)
  }

  const openEditDayDialog = (tempId: string) => {
    const idx = fields.findIndex((d) => d.tempId === tempId)
    const day = idx >= 0 ? fields[idx] : null
    setEditingDay(day ?? null)
    setEditingDayIndex(idx >= 0 ? idx : null)
    setDayDialogKey((k) => k + 1)
    setIsDayDialogOpen(true)
  }

  const removeDayFromForm = (tempId: string) => {
    const idx = fields.findIndex((d) => d.tempId === tempId)
    if (idx >= 0) remove(idx)
  }

  const handleDaySave = (day: DayFormState) => {
    if (editingDayIndex !== null) {
      update(editingDayIndex, day)
    } else {
      append(day)
    }
  }

  const onSubmit = (rootFields: EdicionRootFormInput) => {
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
      } else {
        toast.success(
          selectedEdicionId ? 'Edición actualizada' : 'Edición creada'
        )
        closeDialog()
        router.refresh()
      }
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
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger id='edicion-evento'>
                  <SelectValue placeholder='Seleccionar evento...'>
                    {eventos.find((e) => e.id === field.value)?.nombre}
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
          disabled={isPending || (!isDirty && !!selectedEdicionId) || !isValid}
        >
          {isPending
            ? 'Guardando...'
            : selectedEdicionId
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

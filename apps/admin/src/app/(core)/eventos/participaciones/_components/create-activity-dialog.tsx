'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useFormState, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { useParticipationsStore } from '../_store/use-participations-store'
import { createActivityAction } from '../_actions/activities/create-activity.action'
import {
  type ActivityFormInput,
  activityFormSchema
} from '../_schemas/activity.schema'
import {
  ACTIVITY_IDS,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
  ActivityId,
  ENTRY_MODE_IDS,
  ENTRY_MODE_LABELS,
  EntryModeId,
  PARTICIPANT_TYPE,
  PARTICIPANT_TYPE_LABELS,
  PARTICIPATION_STATUS,
  type ParticipantType
} from '../_constants/participations.constants'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import {
  ArtistLookup,
  BandLookup,
  CollectiveLookup
} from '../_types/participations.types'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { ControllerCombobox } from '@/shared/components/controller-combobox'
import { Separator } from '@/shared/components/ui/separator'

interface CreateActivityDialogProps {
  edition: {
    id: number
    editionNumber: string
    eventName: string
  }
  artistas: ArtistLookup[]
  agrupaciones: CollectiveLookup[]
  bandas: BandLookup[]
}

export function CreateActivityDialog({
  edition,
  artistas,
  agrupaciones,
  bandas
}: CreateActivityDialogProps) {
  const isCreateActivityDialogOpen = useParticipationsStore(
    (state) => state.isCreateActivityDialogOpen
  )
  const toggleCreateActivityDialogOpen = useParticipationsStore(
    (state) => state.toggleCreateActivityDialogOpen
  )

  const methods = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    values: {
      participantType: PARTICIPANT_TYPE.ARTISTA,
      modoIngresoId: 1,
      tipoActividadId: 1,
      notas: '',
      estado: PARTICIPATION_STATUS.SELECCIONADO,
      puntaje: null,
      detail: {
        titulo: '',
        descripcion: '',
        duracionMinutos: null,
        cupos: null,
        horaInicio: '',
        ubicacion: ''
      },
      entity: {
        artistaId: null,
        agrupacionId: null,
        bandaId: null
      }
    },
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid, errors } = useFormState({
    control: methods.control
  })

  const tipo = useWatch({
    control: methods.control,
    name: 'participantType'
  })

  const onSubmit = async (values: ActivityFormInput) => {
    const result = await createActivityAction({
      participation: {
        edicionId: edition.id,
        artistaId: values.entity.artistaId,
        agrupacionId: values.entity.agrupacionId,
        bandaId: values.entity.bandaId,
        notas: values.notas
      },
      activity: {
        tipoActividadId:
          tipo === PARTICIPANT_TYPE.BANDA
            ? ACTIVITY_TYPES.MUSICA
            : values.tipoActividadId,
        modoIngresoId: values.modoIngresoId,
        notas: values.notas,
        estado: values.estado
      },
      detail: {
        titulo: values.detail.titulo,
        descripcion: values.detail.descripcion,
        duracionMinutos: values.detail.duracionMinutos,
        ubicacion: values.detail.ubicacion,
        horaInicio: values.detail.horaInicio,
        cupos: values.detail.cupos
      }
    })

    if (!result.success) {
      toast.error(
        result.errors
          ? result.errors.map((error) => error.message).join(', ')
          : 'Error al agregar actividad'
      )
      return
    }

    toast.success('Actividad agregada correctamente')
    methods.reset()
    toggleCreateActivityDialogOpen(false)
  }

  const comboboxArtists = artistas
    .filter((a) => a.statusId !== ARTIST_STATUS.CANCELLED)
    .map((artist) => ({
      label: artist.pseudonym,
      value: artist.id
    }))

  const comboboxAgrupaciones = agrupaciones.map((agrupacion) => ({
    label: agrupacion.name,
    value: agrupacion.id
  }))

  const comboboxBandas = bandas.map((banda) => ({
    label: banda.name,
    value: banda.id
  }))

  return (
    <EntityFormDialog
      open={isCreateActivityDialogOpen}
      onOpenChange={toggleCreateActivityDialogOpen}
      title={`Agregar Actividad: ${edition.eventName} ${edition.editionNumber}`}
      description='Añade un participante a una actividad específica en esta edición.'
      className='sm:max-w-3xl'
      triggerLabel='Agregar Actividad'
      submit={{
        label: 'Agregar',
        isSubmitting,
        disabled: !isDirty || !isValid || isSubmitting,
        form: 'create-activity-form'
      }}
    >
      <form
        id='create-activity-form'
        className='flex gap-4'
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Field>
            <FieldLabel>Tipo de Participante</FieldLabel>
            <Controller
              name='participantType'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const nextTipo = value as ParticipantType

                    field.onChange(nextTipo)

                    if (nextTipo === PARTICIPANT_TYPE.ARTISTA) {
                      methods.setValue('entity.agrupacionId', null, {
                        shouldDirty: true
                      })
                      methods.setValue('entity.bandaId', null, {
                        shouldDirty: true
                      })
                      return
                    }

                    if (nextTipo === PARTICIPANT_TYPE.AGRUPACION) {
                      methods.setValue('entity.artistaId', null, {
                        shouldDirty: true
                      })
                      methods.setValue('entity.bandaId', null, {
                        shouldDirty: true
                      })
                      return
                    }

                    methods.setValue('entity.artistaId', null, {
                      shouldDirty: true
                    })
                    methods.setValue('entity.agrupacionId', null, {
                      shouldDirty: true
                    })
                    methods.setValue('tipoActividadId', ACTIVITY_TYPES.MUSICA, {
                      shouldDirty: true,
                      shouldValidate: true
                    })
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {PARTICIPANT_TYPE_LABELS[field.value]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PARTICIPANT_TYPE.ARTISTA}>
                      Artista Individual
                    </SelectItem>
                    <SelectItem value={PARTICIPANT_TYPE.AGRUPACION}>
                      Agrupación
                    </SelectItem>
                    <SelectItem value={PARTICIPANT_TYPE.BANDA}>
                      Banda
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {tipo === PARTICIPANT_TYPE.ARTISTA && (
            <ControllerCombobox
              label='Artista'
              name='entity.artistaId'
              control={methods.control}
              items={comboboxArtists}
              placeholder='Buscar artista...'
              emptyText='No hay artistas disponibles'
            />
          )}

          {tipo === PARTICIPANT_TYPE.AGRUPACION && (
            <ControllerCombobox
              label='Agrupación'
              name='entity.agrupacionId'
              control={methods.control}
              items={comboboxAgrupaciones}
              placeholder='Buscar agrupación...'
              emptyText='No hay agrupaciones disponibles'
            />
          )}

          {tipo === PARTICIPANT_TYPE.BANDA && (
            <ControllerCombobox
              label='Banda'
              name='entity.bandaId'
              control={methods.control}
              items={comboboxBandas}
              placeholder='Buscar banda...'
              emptyText='No hay bandas disponibles'
            />
          )}

          <Field>
            <FieldLabel>Tipo de Actividad</FieldLabel>
            <Controller
              name='tipoActividadId'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={
                    tipo === PARTICIPANT_TYPE.BANDA
                      ? ACTIVITY_TYPES.MUSICA
                      : field.value
                  }
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isSubmitting || tipo === PARTICIPANT_TYPE.BANDA}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {ACTIVITY_TYPE_LABELS[field.value as ActivityId]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {ACTIVITY_TYPE_LABELS[id]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {tipo === PARTICIPANT_TYPE.BANDA && (
              <p className='text-muted-foreground text-xs'>
                Las bandas solo pueden participar en actividades de tipo{' '}
                {ACTIVITY_TYPE_LABELS[ACTIVITY_TYPES.MUSICA]}.
              </p>
            )}
            {errors.tipoActividadId && (
              <FieldError>{errors.tipoActividadId.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Modo de ingreso</FieldLabel>
            <Controller
              name='modoIngresoId'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {ENTRY_MODE_LABELS[field.value as EntryModeId]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_MODE_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {ENTRY_MODE_LABELS[id]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.modoIngresoId && (
              <FieldError>{errors.modoIngresoId.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Notas (opcional)</FieldLabel>
            <Textarea
              {...methods.register('notas')}
              placeholder='Notas sobre esta participación...'
              rows={2}
              disabled={isSubmitting}
            />
          </Field>
        </FieldGroup>

        <Separator orientation='vertical' />

        <FieldGroup>
          <Field>
            <FieldLabel>Título de la Actividad</FieldLabel>
            <Input
              {...methods.register('detail.titulo')}
              placeholder='Ej: Taller de Ilustración'
              disabled={isSubmitting}
            />
          </Field>

          <Field>
            <FieldLabel>Descripción (opcional)</FieldLabel>
            <Textarea
              {...methods.register('detail.descripcion')}
              placeholder='De qué trata la actividad...'
              rows={3}
              disabled={isSubmitting}
            />
          </Field>

          <FieldGroup className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Field>
              <FieldLabel>Duración (minutos)</FieldLabel>
              <Controller
                name='detail.duracionMinutos'
                control={methods.control}
                render={({ field }) => (
                  <Input
                    type='number'
                    placeholder='Ej: 90'
                    disabled={isSubmitting}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel>Cupos Totales</FieldLabel>
              <Controller
                name='detail.cupos'
                control={methods.control}
                render={({ field }) => (
                  <Input
                    type='number'
                    placeholder='Ej: 30'
                    disabled={isSubmitting}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Hora Inicio</FieldLabel>
              <Input
                {...methods.register('detail.horaInicio')}
                type='time'
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel>Ubicación</FieldLabel>
              <Input
                {...methods.register('detail.ubicacion')}
                placeholder='Ej: Sala 3'
                disabled={isSubmitting}
              />
            </Field>
          </FieldGroup>
        </FieldGroup>
      </form>
    </EntityFormDialog>
  )
}

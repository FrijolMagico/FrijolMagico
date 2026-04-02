'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  type ActivityFormInput,
  activityFormSchema
} from '../_schemas/activity.schema'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { useParticipationsStore } from '../_store/use-participations-store'
import {
  ACTIVITY_IDS,
  ACTIVITY_TYPE_LABELS,
  ActivityId,
  ENTRY_MODE_IDS,
  ENTRY_MODE_LABELS,
  EntryModeId,
  PARTICIPATION_STATUS,
  PARTICIPATION_STATUS_LABELS,
  PARTICIPATION_STATUSES
} from '../_constants/participations.constants'
import { updateParticipationAction } from '../_actions/participations/update-participation.action'
import { updateActivityAction } from '../_actions/activities/update-activity.action'
import { updateActivityDetailAction } from '../_actions/activities/update-activity-detail.action'
import { executeUpdatePlan } from '../_lib/execute-update-plan'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'

interface UpdateActivityDialogProps {
  edition: {
    id: number
    editionNumber: string
    eventName: string
  }
}

export function UpdateActivityDialog({ edition }: UpdateActivityDialogProps) {
  const selectedActivity = useParticipationsStore((s) => s.selectedActivity)
  const isUpdateActivityDialogOpen = useParticipationsStore(
    (s) => s.isUpdateActivityDialogOpen
  )
  const closeUpdateDialogs = useParticipationsStore((s) => s.closeUpdateDialogs)

  const { entity, activity } = selectedActivity ?? {}

  const methods = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    values: {
      participantType: 'artista',
      tipoActividadId: activity?.tipoActividadId ?? 1,
      modoIngresoId: activity?.modoIngresoId ?? 1,
      notas: activity?.notas ?? '',
      estado: activity?.estado ?? PARTICIPATION_STATUS.COMPLETADO,
      puntaje: activity?.puntaje ?? null,
      entity: {
        artistaId: entity?.artist?.id ?? null,
        agrupacionId: entity?.collective?.id ?? null,
        bandaId: entity?.band?.id ?? null
      },
      detail: {
        titulo: activity?.detail?.titulo ?? '',
        descripcion: activity?.detail?.descripcion ?? '',
        duracionMinutos: activity?.detail?.duracionMinutos ?? null,
        cupos: activity?.detail?.cupos ?? null,
        horaInicio: activity?.detail?.horaInicio ?? '',
        ubicacion: activity?.detail?.ubicacion ?? ''
      }
    },
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid, errors } = useFormState({
    control: methods.control
  })

  if (!entity || !activity) return null

  const onSubmit = async (values: ActivityFormInput) => {
    const result = await executeUpdatePlan([
      {
        label: 'la participación',
        initial: {
          id: activity.participacionId,
          edicionId: edition.id,
          artistaId: entity.artist?.id ?? null,
          agrupacionId: entity.collective?.id ?? null,
          bandaId: entity.band?.id ?? null
        },
        current: {
          id: activity.participacionId,
          edicionId: edition.id,
          artistaId: values.entity.artistaId,
          agrupacionId: values.entity.agrupacionId,
          bandaId: values.entity.bandaId
        },
        execute: () =>
          updateParticipationAction({
            id: activity.participacionId,
            edicionId: edition.id,
            artistaId: values.entity.artistaId,
            agrupacionId: values.entity.agrupacionId,
            bandaId: values.entity.bandaId
          })
      },
      {
        label: 'la actividad',
        initial: {
          id: activity.id,
          participacionId: activity.participacionId,
          tipoActividadId: activity.tipoActividadId,
          modoIngresoId: activity.modoIngresoId,
          notas: activity.notas ?? '',
          estado: activity.estado,
          puntaje: activity.puntaje ?? null
        },
        current: {
          id: activity.id,
          participacionId: activity.participacionId,
          tipoActividadId: values.tipoActividadId,
          modoIngresoId: values.modoIngresoId,
          notas: values.notas,
          estado: values.estado,
          puntaje: values.puntaje
        },
        execute: () =>
          updateActivityAction({
            id: activity.id,
            participacionId: activity.participacionId,
            tipoActividadId: values.tipoActividadId,
            modoIngresoId: values.modoIngresoId,
            notas: values.notas,
            estado: values.estado,
            puntaje: values.puntaje
          })
      },
      ...(activity.detail
        ? [
            {
              label: 'el detalle de actividad',
              initial: {
                id: activity.detail.id,
                titulo: activity.detail.titulo ?? '',
                descripcion: activity.detail.descripcion ?? '',
                duracionMinutos: activity.detail.duracionMinutos ?? null,
                cupos: activity.detail.cupos ?? null,
                horaInicio: activity.detail.horaInicio ?? '',
                ubicacion: activity.detail.ubicacion ?? ''
              },
              current: {
                id: activity.detail.id,
                titulo: values.detail.titulo ?? '',
                descripcion: values.detail.descripcion ?? '',
                duracionMinutos: values.detail.duracionMinutos ?? null,
                cupos: values.detail.cupos ?? null,
                horaInicio: values.detail.horaInicio ?? '',
                ubicacion: values.detail.ubicacion ?? ''
              },
              execute: () =>
                updateActivityDetailAction(activity.participacionId!, {
                  id: activity.detail!.id,
                  titulo: values.detail.titulo,
                  descripcion: values.detail.descripcion,
                  duracionMinutos: values.detail.duracionMinutos,
                  cupos: values.detail.cupos,
                  horaInicio: values.detail.horaInicio,
                  ubicacion: values.detail.ubicacion
                })
            }
          ]
        : [])
    ])

    if (!result.success) {
      toast.error(result.errorMessage)
      return
    }

    toast.success('Cambios guardados')
    methods.reset(values)
  }

  const detailId = activity.detail?.id
  const isBand = Boolean(entity.band)
  const entityTitle =
    entity.artist?.pseudonym ??
    entity.collective?.name ??
    entity.band?.name ??
    'Sin nombre'

  return (
    <EntityFormDialog
      open={isUpdateActivityDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeUpdateDialogs()
      }}
      title={`Editar actividad: ${entityTitle} en ${edition.eventName} ${edition.editionNumber}`}
      description='Modifica los detalles de esta actividad.'
      className='sm:max-w-3xl'
      submit={{
        label: 'Guardar cambios',
        disabled: !isDirty || isSubmitting || !isValid,
        isSubmitting,
        form: 'update-activity-form'
      }}
    >
      <form
        id='update-activity-form'
        className='flex gap-4'
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Field>
            <FieldLabel>Tipo</FieldLabel>
            <Controller
              name='tipoActividadId'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={String(field.value ?? '')}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isBand || isSubmitting}
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
            {isBand && (
              <p className='text-muted-foreground text-xs'>
                Las bandas solo pueden participar en actividades de música.
              </p>
            )}
            {errors.tipoActividadId && (
              <FieldError>{errors.tipoActividadId.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Estado</FieldLabel>
            <Controller
              name='estado'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {PARTICIPATION_STATUS_LABELS[field.value]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PARTICIPATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PARTICIPATION_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estado && <FieldError>{errors.estado.message}</FieldError>}
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
            <FieldLabel htmlFor={`actividad-notas-${activity.id}`}>
              Notas (opcional)
            </FieldLabel>
            <Textarea
              id={`actividad-notas-${activity.id}`}
              {...methods.register('notas')}
              rows={2}
              placeholder='Notas...'
              disabled={isSubmitting}
            />
            {errors.notas && <FieldError>{errors.notas.message}</FieldError>}
          </Field>
        </FieldGroup>

        <Separator orientation='vertical' />

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`detalle-titulo-${detailId}`}>
              Titulo
            </FieldLabel>
            <Input
              id={`detalle-titulo-${detailId}`}
              {...methods.register('detail.titulo')}
              placeholder='Titulo de la actividad'
              disabled={isSubmitting}
            />
            {errors.detail?.titulo && (
              <FieldError>{errors.detail.titulo.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor={`detalle-descripcion-${detailId}`}>
              Descripcion
            </FieldLabel>
            <Textarea
              id={`detalle-descripcion-${detailId}`}
              {...methods.register('detail.descripcion')}
              rows={2}
              disabled={isSubmitting}
            />
            {errors.detail?.descripcion && (
              <FieldError>{errors.detail.descripcion.message}</FieldError>
            )}
          </Field>

          <div className='grid grid-cols-2 gap-3'>
            <Field>
              <FieldLabel htmlFor={`detalle-duracion-${detailId}`}>
                Duracion (min)
              </FieldLabel>
              <Controller
                name='detail.duracionMinutos'
                control={methods.control}
                render={({ field }) => (
                  <Input
                    id={`detalle-duracion-${detailId}`}
                    type='number'
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
              {errors.detail?.duracionMinutos && (
                <FieldError>{errors.detail.duracionMinutos.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor={`detalle-cupos-${detailId}`}>
                Cupos
              </FieldLabel>
              <Controller
                name='detail.cupos'
                control={methods.control}
                render={({ field }) => (
                  <Input
                    id={`detalle-cupos-${detailId}`}
                    type='number'
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
              {errors.detail?.cupos && (
                <FieldError>{errors.detail.cupos.message}</FieldError>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`detalle-hora-${detailId}`}>
              Hora de inicio
            </FieldLabel>
            <Input
              id={`detalle-hora-${detailId}`}
              type='time'
              {...methods.register('detail.horaInicio')}
              disabled={isSubmitting}
            />
            {errors.detail?.horaInicio && (
              <FieldError>{errors.detail.horaInicio.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor={`detalle-ubicacion-${detailId}`}>
              Ubicacion
            </FieldLabel>
            <Input
              id={`detalle-ubicacion-${detailId}`}
              {...methods.register('detail.ubicacion')}
              placeholder='Sala, espacio...'
              disabled={isSubmitting}
            />
            {errors.detail?.ubicacion && (
              <FieldError>{errors.detail.ubicacion.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor={`activity-notes-${activity.id}`}>
              Notas
            </FieldLabel>
            <Textarea
              id={`activity-notes-${activity.id}`}
              {...methods.register('notas')}
              disabled={isSubmitting}
              rows={2}
              placeholder='Notas...'
            />
            {errors.notas && <FieldError>{errors.notas.message}</FieldError>}
          </Field>
        </FieldGroup>
      </form>
    </EntityFormDialog>
  )
}

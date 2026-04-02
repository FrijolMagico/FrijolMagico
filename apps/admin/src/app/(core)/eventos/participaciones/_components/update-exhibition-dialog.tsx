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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  ExhibitionFormInput,
  exhibitionFormSchema
} from '../_schemas/exhibition.schema'
import { updateExhibitionAction } from '../_actions/exhibitions/update-exhibition.action'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import {
  DISCIPLINE_IDS,
  DISCIPLINE_LABELS,
  ENTRY_MODE_IDS,
  ENTRY_MODE_LABELS,
  PARTICIPANT_TYPE,
  PARTICIPATION_STATUS,
  PARTICIPATION_STATUS_LABELS
} from '../_constants/participations.constants'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { useParticipationsStore } from '../_store/use-participations-store'
import { updateParticipationAction } from '../_actions/participations/update-participation.action'
import { executeUpdatePlan } from '../_lib/execute-update-plan'

interface ExhibitionEditorFormProps {
  edition: {
    id: number
    editionNumber: string
    eventName: string
  }
}

export function UpdateExhibitionDialog({ edition }: ExhibitionEditorFormProps) {
  const selectedExhibition = useParticipationsStore((s) => s.selectedExhibition)
  const { entity, exhibition } = selectedExhibition ?? {}

  const isUpdateExhibitionDialogOpen = useParticipationsStore(
    (s) => s.isUpdateExhibitionDialogOpen
  )
  const closeUpdateDialogs = useParticipationsStore((s) => s.closeUpdateDialogs)

  const methods = useForm<ExhibitionFormInput>({
    resolver: zodResolver(exhibitionFormSchema),
    values: {
      participantType: PARTICIPANT_TYPE.ARTISTA,
      modoIngresoId: exhibition?.modoIngresoId ?? 1,
      disciplinaId: exhibition?.disciplinaId ?? 1,
      notas: exhibition?.notas ?? '',
      estado: exhibition?.estado ?? PARTICIPATION_STATUS.SELECCIONADO,
      puntaje: exhibition?.puntaje ?? null,
      entity: {
        artistaId: entity?.artist?.id ?? null,
        agrupacionId: entity?.collective?.id ?? null
      }
    },
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid, errors } = useFormState({
    control: methods.control
  })

  if (!entity || !exhibition) return null

  const onSubmit = async (values: ExhibitionFormInput) => {
    const result = await executeUpdatePlan([
      {
        label: 'la participación',
        initial: {
          id: exhibition.participacionId,
          edicionId: edition.id,
          artistaId: entity.artist?.id ?? null,
          agrupacionId: entity.collective?.id ?? null
        },
        current: {
          id: exhibition.participacionId,
          edicionId: edition.id,
          artistaId: values.entity.artistaId,
          agrupacionId: values.entity.agrupacionId
        },
        execute: () =>
          updateParticipationAction({
            id: exhibition.participacionId,
            edicionId: edition.id,
            artistaId: values.entity.artistaId,
            agrupacionId: values.entity.agrupacionId
          })
      },
      {
        label: 'la exhibición',
        initial: {
          id: exhibition.id,
          participacionId: exhibition.participacionId,
          disciplinaId: exhibition.disciplinaId,
          modoIngresoId: exhibition.modoIngresoId,
          notas: exhibition.notas ?? '',
          estado: exhibition.estado,
          puntaje: exhibition.puntaje ?? null
        },
        current: {
          id: exhibition.id,
          participacionId: exhibition.participacionId,
          disciplinaId: values.disciplinaId,
          modoIngresoId: values.modoIngresoId,
          notas: values.notas,
          estado: values.estado,
          puntaje: values.puntaje
        },
        execute: () =>
          updateExhibitionAction({
            id: exhibition.id,
            participacionId: exhibition.participacionId,
            disciplinaId: values.disciplinaId,
            modoIngresoId: values.modoIngresoId,
            notas: values.notas,
            estado: values.estado,
            puntaje: values.puntaje
          })
      }
    ])

    if (!result.success) {
      toast.error(result.errorMessage)
      return
    }

    toast.success('Cambios guardados')
    methods.reset(values)
  }

  const isBanned = ARTIST_STATUS.CANCELLED === entity.artist?.statusId
  const entityTitle =
    entity.artist?.pseudonym || entity.collective?.name || entity.band?.name

  return (
    <EntityFormDialog
      open={isUpdateExhibitionDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeUpdateDialogs()
      }}
      title={`Editar expositor: ${entityTitle} en ${edition.eventName} ${edition.editionNumber}`}
      description='Modifica los detalles de esta exhibición.'
      submit={{
        label: 'Guardar cambios',
        disabled: !isDirty || isSubmitting || !isValid,
        isSubmitting,
        form: `update-exhibition-form`
      }}
    >
      <form
        className='flex flex-col gap-4'
        onSubmit={methods.handleSubmit(onSubmit)}
        id='update-exhibition-form'
      >
        <FieldGroup>
          <Field>
            <FieldLabel>Disciplina</FieldLabel>
            <Controller
              name='disciplinaId'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isBanned || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>{DISCIPLINE_LABELS[field.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINE_IDS.map((disciplineId) => (
                      <SelectItem key={disciplineId} value={disciplineId}>
                        {
                          DISCIPLINE_LABELS[
                            disciplineId as keyof typeof DISCIPLINE_LABELS
                          ]
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.disciplinaId && (
              <FieldError>{errors.disciplinaId.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Estado</FieldLabel>
            <Controller
              name='estado'
              control={methods.control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(val) => field.onChange(val)}
                  disabled={isBanned || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {PARTICIPATION_STATUS_LABELS[field.value]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PARTICIPATION_STATUS_LABELS).map(
                      ([id, label]) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      )
                    )}
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
                  value={String(field.value ?? '')}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={isBanned || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue>{ENTRY_MODE_LABELS[field.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_MODE_IDS.map((entryModeId) => (
                      <SelectItem key={entryModeId} value={entryModeId}>
                        {ENTRY_MODE_LABELS[entryModeId]}
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
            <FieldLabel htmlFor={`exhibition-notes-${exhibition.id}`}>
              Notas
            </FieldLabel>
            <Textarea
              id={`exhibition-notes-${exhibition.id}`}
              {...methods.register('notas')}
              disabled={isBanned || isSubmitting}
              rows={2}
              placeholder={
                isBanned ? 'Artista vetado — campos deshabilitados' : 'Notas...'
              }
            />
            {errors.notas && <FieldError>{errors.notas.message}</FieldError>}
          </Field>
        </FieldGroup>
      </form>
    </EntityFormDialog>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useFormState, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { useParticipationsStore } from '../_store/use-participations-store'
import { createExhibitionAction } from '../_actions/exhibitions/create-exhibition.action'
import {
  ExhibitionFormInput,
  exhibitionFormSchema
} from '../_schemas/exhibition.schema'
import {
  DISCIPLINE_IDS,
  DISCIPLINE_LABELS,
  ENTRY_MODE_IDS,
  ENTRY_MODE_LABELS,
  PARTICIPANT_TYPE,
  PARTICIPANT_TYPE_LABELS,
  PARTICIPATION_STATUS,
  PARTICIPATION_STATUS_LABELS
} from '../_constants/participations.constants'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { ArtistLookup, CollectiveLookup } from '../_types/participations.types'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { ControllerCombobox } from '@/shared/components/controller-combobox'

interface CreateExhibitionDialogProps {
  edition: {
    id: number
    editionNumber: string
    eventName: string
  }
  artistas: ArtistLookup[]
  agrupaciones: CollectiveLookup[]
}

export function CreateExhibitionDialog({
  edition,
  artistas,
  agrupaciones
}: CreateExhibitionDialogProps) {
  const isCreateExhibitionDialogOpen = useParticipationsStore(
    (state) => state.isCreateExhibitionDialogOpen
  )
  const toggleCreateExhibitionDialogOpen = useParticipationsStore(
    (state) => state.toggleCreateExhibitionDialogOpen
  )

  const methods = useForm<ExhibitionFormInput>({
    resolver: zodResolver(exhibitionFormSchema),
    values: {
      participantType: PARTICIPANT_TYPE.ARTISTA,
      modoIngresoId: 1,
      disciplinaId: 1,
      notas: '',
      estado: PARTICIPATION_STATUS.SELECCIONADO,
      puntaje: null,
      entity: {
        artistaId: null,
        agrupacionId: null
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

  const onSubmit = async (values: ExhibitionFormInput) => {
    const result = await createExhibitionAction({
      participation: {
        edicionId: edition.id,
        artistaId: values.entity.artistaId,
        agrupacionId: values.entity.agrupacionId
      },

      // TECH DEBT: We should create puntaje field in the form, so admins can adjust it when createing an exhibition.
      exhibition: {
        disciplinaId: values.disciplinaId,
        modoIngresoId: values.modoIngresoId,
        estado: values.estado,
        notas: values.notas
      }
    })

    if (!result.success) {
      toast.error(
        result.errors
          ? result.errors.map((error) => error.message).join(', ')
          : 'Error al agregar expositor'
      )
      return
    }

    toast.success('Expositor agregado correctamente')
    methods.reset()
    toggleCreateExhibitionDialogOpen(false)
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

  return (
    <EntityFormDialog
      open={isCreateExhibitionDialogOpen}
      onOpenChange={toggleCreateExhibitionDialogOpen}
      title={`Agregar Expositor: ${edition.eventName} ${edition.editionNumber}`}
      description='Añade un artista o agrupación como expositor a esta edición.'
      triggerLabel='Agregar Expositor'
      submit={{
        label: 'Agregar',
        isSubmitting,
        disabled: !isDirty || !isValid || isSubmitting,
        form: 'create-exhibition-form'
      }}
    >
      <form
        id='create-exhibition-form'
        className='flex flex-col gap-4'
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <Field className='flex flex-col gap-2'>
          <FieldLabel>Tipo de Participante</FieldLabel>
          <Controller
            name='participantType'
            control={methods.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)

                  if (value === PARTICIPANT_TYPE.ARTISTA) {
                    methods.setValue('entity.agrupacionId', null, {
                      shouldDirty: true
                    })
                    return
                  }

                  methods.setValue('entity.artistaId', null, {
                    shouldDirty: true
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
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {tipo === PARTICIPANT_TYPE.ARTISTA ? (
          <ControllerCombobox
            label='Artista'
            name='entity.artistaId'
            control={methods.control}
            items={comboboxArtists}
            placeholder='Buscar artista...'
            emptyText='No hay artistas disponibles'
          />
        ) : (
          <ControllerCombobox
            label='Agrupación'
            name='entity.agrupacionId'
            control={methods.control}
            items={comboboxAgrupaciones}
            placeholder='Buscar agrupación...'
            emptyText='No hay agrupaciones disponibles'
          />
        )}

        <Field>
          <FieldLabel>Disciplina</FieldLabel>
          <Controller
            name='disciplinaId'
            control={methods.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(Number(val))}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
          <FieldLabel htmlFor='exhibition-notes'>Notas</FieldLabel>
          <Textarea
            id='exhibition-notes'
            {...methods.register('notas')}
            disabled={isSubmitting}
            rows={2}
          />
          {errors.notas && <FieldError>{errors.notas.message}</FieldError>}
        </Field>
      </form>
    </EntityFormDialog>
  )
}

'use client'

import { useId, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/shared/components/ui/combobox'
import {
  Field,
  FieldError,
  FieldLabel
} from '@/shared/components/ui/field'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ActivityFormInput } from '../_schemas/activity.schema'
import type { ArtistLookup } from '../_types/participations.types'

interface ActivityPresenterFieldsProps {
  methods: UseFormReturn<ActivityFormInput>
  artistas: ArtistLookup[]
  disabled?: boolean
}

interface PresenterOption {
  id: string
  artistId: number
  pseudonymId: number
  pseudonym: string
}

export function resolvePresenterText(value: string) {
  const presenterNombre = value.trim()
  return presenterNombre ? { type: 'free' as const, presenterNombre } : { type: 'none' as const }
}

export function classifyPresenterInputAction(reason: string): 'type' | 'clear' | 'ignore' {
  if (reason === 'input-change') return 'type'
  if (reason === 'clear-press') return 'clear'
  return 'ignore'
}

export function applyPresenterOption(
  methods: UseFormReturn<ActivityFormInput>,
  option: Pick<PresenterOption, 'artistId' | 'pseudonymId'>,
  cancelPending: () => void
) {
  cancelPending()
  methods.setValue('detail', {
    ...methods.getValues('detail'),
    presenterNombre: '',
    presenterArtistaId: option.artistId,
    presenterPseudonimoId: option.pseudonymId
  }, { shouldDirty: true, shouldValidate: true })
}

export function ActivityPresenterFields({
  methods,
  artistas,
  disabled = false
}: ActivityPresenterFieldsProps) {
  const inputId = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const presenterNombre = useWatch({ control: methods.control, name: 'detail.presenterNombre' }) ?? ''
  const artistId = useWatch({ control: methods.control, name: 'detail.presenterArtistaId' })
  const pseudonymId = useWatch({ control: methods.control, name: 'detail.presenterPseudonimoId' })
  const errors = methods.formState.errors.detail
  const options: PresenterOption[] = artistas
    .filter((artist) => artist.statusId !== ARTIST_STATUS.CANCELLED)
    .flatMap((artist) => artist.pseudonyms.map((pseudonym) => ({
      id: String(pseudonym.id),
      artistId: artist.id,
      pseudonymId: pseudonym.id,
      pseudonym: pseudonym.pseudonym
    })))
  const selectedOption = options.find(
    (option) => option.artistId === artistId && option.pseudonymId === pseudonymId
  )
  const inputValue = draft ?? selectedOption?.pseudonym ?? presenterNombre
  const presenterNombreError = errors?.presenterNombre?.message
  const presenterArtistaIdError = errors?.presenterArtistaId?.message
  const presenterPseudonimoIdError = errors?.presenterPseudonimoId?.message
  const describedBy = [
    presenterNombreError && `${inputId}-presenter-name-error`,
    presenterArtistaIdError && `${inputId}-artist-error`,
    presenterPseudonimoIdError && `${inputId}-pseudonym-error`
  ].filter(Boolean).join(' ') || undefined

  const setPresenter = (name: string, linkedArtistId: number | null, linkedPseudonymId: number | null) => {
    methods.setValue('detail', {
      ...methods.getValues('detail'),
      presenterNombre: name,
      presenterArtistaId: linkedArtistId,
      presenterPseudonimoId: linkedPseudonymId
    }, { shouldDirty: true, shouldValidate: true })
  }

  const updateFromText = (value: string) => {
    const resolution = resolvePresenterText(value)
    setPresenter(resolution.type === 'free' ? resolution.presenterNombre : '', null, null)
  }

  const resolveDebounced = useDebouncedCallback(updateFromText, 300)

  const selectOption = (value: string | null) => {
    const option = options.find((candidate) => candidate.id === value)
    if (!option) return
    setDraft(null)
    applyPresenterOption(methods, option, () => resolveDebounced.cancel())
  }

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>Presentador (opcional)</FieldLabel>
      <Combobox
        items={options.map((option) => option.id)}
        value={selectedOption?.id ?? null}
        inputValue={inputValue}
        itemToStringLabel={(id) => options.find((option) => option.id === id)?.pseudonym ?? ''}
        onValueChange={selectOption}
        onInputValueChange={(value, { reason }) => {
          const action = classifyPresenterInputAction(reason)
          if (action === 'clear') {
            resolveDebounced.cancel()
            setDraft(null)
            setPresenter('', null, null)
          } else if (action === 'type') {
            setDraft(value)
            // Keep the form current for an immediate Save; normalization never controls the draft.
            setPresenter(value, null, null)
            resolveDebounced(value)
          }
        }}
        filter={(id, query) =>
          options.find((option) => option.id === id)?.pseudonym.toLowerCase().includes(query.trim().toLowerCase()) ?? false
        }
        disabled={disabled}
      >
        <ComboboxInput
          id={inputId}
          aria-label='Presentador (opcional)'
          aria-invalid={describedBy ? true : undefined}
          aria-describedby={describedBy}
          placeholder='Buscar o escribir un presentador'
          showClear
          disabled={disabled}
          onBlur={() => {
            if (draft !== null) {
              resolveDebounced.cancel()
              updateFromText(draft)
              setDraft(null)
            }
          }}
        />
        <ComboboxContent>
          <ComboboxEmpty>No se encontraron pseudónimos</ComboboxEmpty>
          <ComboboxList>
            {(id: string) => {
              const option = options.find((candidate) => candidate.id === id)
              if (!option) return null
              return (
                <ComboboxItem key={id} value={id}>
                  {option.pseudonym}
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {presenterNombreError && <FieldError id={`${inputId}-presenter-name-error`}>{presenterNombreError}</FieldError>}
      {presenterArtistaIdError && <FieldError id={`${inputId}-artist-error`}>{presenterArtistaIdError}</FieldError>}
      {presenterPseudonimoIdError && <FieldError id={`${inputId}-pseudonym-error`}>{presenterPseudonimoIdError}</FieldError>}
    </Field>
  )
}

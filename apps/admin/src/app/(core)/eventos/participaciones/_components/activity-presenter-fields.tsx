'use client'

import { useId } from 'react'
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

type PresenterTextResolution =
  | { type: 'none' }
  | { type: 'free'; presenterNombre: string }
  | { type: 'linked'; artistId: number; pseudonymId: number }

export function resolvePresenterText(
  value: string,
  artists: ArtistLookup[]
): PresenterTextResolution {
  const presenterNombre = value.trim()
  if (!presenterNombre) return { type: 'none' }

  const matchingOptions = artists
    .filter((artist) => artist.statusId !== ARTIST_STATUS.CANCELLED)
    .flatMap((artist) => artist.pseudonyms.map((pseudonym) => ({
      artistId: artist.id,
      pseudonymId: pseudonym.id,
      pseudonym: pseudonym.pseudonym
    })))
    .filter((option) => option.pseudonym.toLowerCase() === presenterNombre.toLowerCase())

  if (matchingOptions.length === 1) {
    const match = matchingOptions[0]!
    return {
      type: 'linked',
      artistId: match.artistId,
      pseudonymId: match.pseudonymId
    }
  }

  if (
    matchingOptions.length > 1 &&
    matchingOptions.some((option) => option.pseudonym !== matchingOptions[0]!.pseudonym)
  ) {
    return { type: 'free', presenterNombre }
  }

  return { type: 'free', presenterNombre }
}

export function ActivityPresenterFields({
  methods,
  artistas,
  disabled = false
}: ActivityPresenterFieldsProps) {
  const inputId = useId()
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
  const inputValue = selectedOption?.pseudonym ?? presenterNombre
  const presenterNombreError = errors?.presenterNombre?.message
  const presenterArtistaIdError = errors?.presenterArtistaId?.message
  const presenterPseudonimoIdError = errors?.presenterPseudonimoId?.message
  const describedBy = [
    presenterNombreError && `${inputId}-presenter-name-error`,
    presenterArtistaIdError && `${inputId}-artist-error`,
    presenterPseudonimoIdError && `${inputId}-pseudonym-error`
  ].filter(Boolean).join(' ') || undefined

  const updateFromText = (value: string) => {
    const resolution = resolvePresenterText(value, artistas)
    if (resolution.type === 'linked') {
      methods.setValue('detail.presenterNombre', '', { shouldDirty: true, shouldValidate: true })
      methods.setValue('detail.presenterArtistaId', resolution.artistId, { shouldDirty: true, shouldValidate: true })
      methods.setValue('detail.presenterPseudonimoId', resolution.pseudonymId, { shouldDirty: true, shouldValidate: true })
      return
    }

    methods.setValue(
      'detail.presenterNombre',
      resolution.type === 'free' ? resolution.presenterNombre : '',
      { shouldDirty: true, shouldValidate: true }
    )
    methods.setValue('detail.presenterArtistaId', null, { shouldDirty: true, shouldValidate: true })
    methods.setValue('detail.presenterPseudonimoId', null, { shouldDirty: true, shouldValidate: true })
  }

  const selectOption = (value: string | null) => {
    const option = options.find((candidate) => candidate.id === value)
    if (!option) {
      updateFromText('')
      return
    }
    methods.setValue('detail.presenterNombre', '', { shouldDirty: true, shouldValidate: true })
    methods.setValue('detail.presenterArtistaId', option.artistId, { shouldDirty: true, shouldValidate: true })
    methods.setValue('detail.presenterPseudonimoId', option.pseudonymId, { shouldDirty: true, shouldValidate: true })
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
          if (reason !== 'item-press') updateFromText(value)
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

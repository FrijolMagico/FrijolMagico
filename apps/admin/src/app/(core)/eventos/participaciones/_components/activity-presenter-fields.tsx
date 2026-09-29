'use client'

import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
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

export function ActivityPresenterFields({
  methods,
  artistas,
  disabled = false
}: ActivityPresenterFieldsProps) {
  const mode = useWatch({ control: methods.control, name: 'detail.presenterMode' })
  const artistId = useWatch({ control: methods.control, name: 'detail.presenterArtistaId' })
  const options = artistas.filter(
    (artist) => artist.statusId !== ARTIST_STATUS.CANCELLED && artist.pseudonyms.length > 0
  )
  const pseudonyms = options.find((artist) => artist.id === artistId)?.pseudonyms ?? []
  const errors = methods.formState.errors.detail

  return (
    <Field>
      <FieldLabel>Presentador (opcional)</FieldLabel>
      <Controller
        name='detail.presenterMode'
        control={methods.control}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value)
              methods.setValue('detail.presenterNombre', '', { shouldDirty: true, shouldValidate: true })
              methods.setValue('detail.presenterArtistaId', null, { shouldDirty: true, shouldValidate: true })
              methods.setValue('detail.presenterPseudonimoId', null, { shouldDirty: true, shouldValidate: true })
            }}
            disabled={disabled}
          >
            <SelectTrigger aria-label='Tipo de presentador'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>Sin presentador</SelectItem>
              <SelectItem value='name'>Nombre libre</SelectItem>
              <SelectItem value='artist'>Artista existente</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      {mode === 'name' && (
        <>
          <Input
            {...methods.register('detail.presenterNombre')}
            aria-label='Nombre del presentador'
            placeholder='Nombre de la persona'
            disabled={disabled}
          />
          {errors?.presenterNombre?.message && <FieldError>{errors.presenterNombre.message}</FieldError>}
        </>
      )}

      {mode === 'artist' && (
        <>
          <Controller
            name='detail.presenterArtistaId'
            control={methods.control}
            render={({ field }) => (
              <Select
                value={field.value == null ? '' : String(field.value)}
                onValueChange={(value) => {
                  field.onChange(Number(value))
                  methods.setValue('detail.presenterPseudonimoId', null, { shouldDirty: true, shouldValidate: true })
                }}
                disabled={disabled || options.length === 0}
              >
                <SelectTrigger aria-label='Artista presentador'>
                  <SelectValue placeholder='Elegir artista'>
                    {options.find((artist) => artist.id === field.value)?.pseudonym ?? 'Elegir artista'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((artist) => (
                    <SelectItem key={artist.id} value={String(artist.id)}>{artist.pseudonym}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name='detail.presenterPseudonimoId'
            control={methods.control}
            render={({ field }) => (
              <Select
                value={field.value == null ? '' : String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={disabled || pseudonyms.length === 0}
              >
                <SelectTrigger aria-label='Pseudónimo del presentador'>
                  <SelectValue placeholder='Elegir pseudónimo'>
                    {pseudonyms.find((pseudonym) => pseudonym.id === field.value)?.pseudonym ?? 'Elegir pseudónimo'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pseudonyms.map((pseudonym) => (
                    <SelectItem key={pseudonym.id} value={String(pseudonym.id)}>
                      {pseudonym.pseudonym}{pseudonym.isPrimary ? ' (principal)' : ' (secundario)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors?.presenterArtistaId?.message && <FieldError>{errors.presenterArtistaId.message}</FieldError>}
          {errors?.presenterPseudonimoId?.message && <FieldError>{errors.presenterPseudonimoId.message}</FieldError>}
        </>
      )}
    </Field>
  )
}

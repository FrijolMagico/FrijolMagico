'use client'

import { Controller, useFormContext } from 'react-hook-form'
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
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/shared/components/ui/field'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { ARTIST_STATUS, STATUS_LABEL_MAP } from '../_constants'
import type {
  ArtistUpdateFormInput,
  HistorialFlags
} from '../_schemas/artista.schema'

interface ArtistFormLayoutProps {
  check?: boolean
}

function HistorialCheck({ name }: { name: keyof HistorialFlags & string }) {
  const { control } = useFormContext<ArtistUpdateFormInput>()

  return (
    <Controller
      name={`historialFlags.${name}`}
      control={control}
      render={({ field }) => (
        <label className='flex cursor-pointer items-center gap-1.5'>
          <Checkbox
            checked={field.value === true}
            onCheckedChange={field.onChange}
          />
          <span className='text-muted-foreground text-[11px] select-none'>
            Historial
          </span>
        </label>
      )}
    />
  )
}

export function ArtistFormLayout({ check }: ArtistFormLayoutProps) {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ArtistUpdateFormInput>()

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='nombre'>Nombre</FieldLabel>
        <Input
          id='nombre'
          {...register('nombre')}
          placeholder='Nombre completo'
        />
      </Field>

      <Field>
        <div className='flex items-center justify-between'>
          <FieldLabel htmlFor='pseudonimo'>
            Pseudónimo <span className='text-destructive'>*</span>
          </FieldLabel>
          {check && <HistorialCheck name='pseudonimo' />}
        </div>
        <Input
          id='pseudonimo'
          {...register('pseudonimo')}
          placeholder='Pseudónimo artístico'
          aria-invalid={!!errors.pseudonimo}
        />
        {errors.pseudonimo && (
          <FieldError>{errors.pseudonimo.message}</FieldError>
        )}
      </Field>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='rut'>RUT</FieldLabel>
          <Input id='rut' {...register('rut')} placeholder='12.345.678-9' />
        </Field>
        <Field>
          <FieldLabel htmlFor='telefono'>Teléfono</FieldLabel>
          <Input
            id='telefono'
            {...register('telefono')}
            placeholder='+56912345678'
          />
        </Field>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <div className='flex items-center justify-between'>
            <FieldLabel htmlFor='correo'>Correo electrónico</FieldLabel>
            {check && <HistorialCheck name='correo' />}
          </div>
          <Input
            id='correo'
            type='email'
            {...register('correo')}
            placeholder='artista@ejemplo.com'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='estadoId'>Estado</FieldLabel>
          <Controller
            name='estadoId'
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(val) => field.onChange(Number(val) || 1)}
              >
                <SelectTrigger id='estadoId'>
                  <SelectValue placeholder='Estado'>
                    {STATUS_LABEL_MAP[field.value as ARTIST_STATUS]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABEL_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.estadoId && (
            <FieldError>{errors.estadoId.message}</FieldError>
          )}
        </Field>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <div className='flex items-center justify-between'>
            <FieldLabel htmlFor='ciudad'>Ciudad</FieldLabel>
            {check && <HistorialCheck name='ciudad' />}
          </div>
          <Input id='ciudad' {...register('ciudad')} placeholder='La Serena' />
        </Field>
        <Field>
          <div className='flex items-center justify-between'>
            <FieldLabel htmlFor='pais'>País</FieldLabel>
            {check && <HistorialCheck name='pais' />}
          </div>
          <Input id='pais' {...register('pais')} placeholder='Chile' />
        </Field>
      </div>
    </FieldGroup>
  )
}

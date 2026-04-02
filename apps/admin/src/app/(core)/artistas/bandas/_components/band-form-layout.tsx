'use client'

import { Controller, useFormContext } from 'react-hook-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import type { BandFormInput } from '../_schemas/banda.schema'

export function BandFormLayout() {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<BandFormInput>()

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='name'>
          Nombre<span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='name'
          {...register('name')}
          placeholder='Nombre de la banda'
          aria-invalid={!!errors.name}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor='description'>Descripción</FieldLabel>
        <Textarea
          id='description'
          {...register('description')}
          placeholder='Descripción breve de la banda'
          rows={4}
        />
        <FieldError>{errors.description?.message}</FieldError>
      </Field>

      <div className='grid gap-4 md:grid-cols-2'>
        <Field>
          <FieldLabel htmlFor='email'>Correo</FieldLabel>
          <Input
            id='email'
            type='email'
            {...register('email')}
            placeholder='banda@ejemplo.com'
            aria-invalid={!!errors.email}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor='phone'>Teléfono</FieldLabel>
          <Input
            id='phone'
            type='tel'
            {...register('phone')}
            placeholder='+56912345678'
          />
          <FieldError>{errors.phone?.message}</FieldError>
        </Field>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Field>
          <FieldLabel htmlFor='city'>Ciudad</FieldLabel>
          <Input id='city' {...register('city')} placeholder='La Serena' />
          <FieldError>{errors.city?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor='country'>País</FieldLabel>
          <Input id='country' {...register('country')} placeholder='Chile' />
          <FieldError>{errors.country?.message}</FieldError>
        </Field>
      </div>

      <Field orientation='horizontal' className='items-center justify-between'>
        <FieldLabel htmlFor='active'>Activa</FieldLabel>
        <Controller
          name='active'
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label='Cambiar estado activo'
            />
          )}
        />
      </Field>
    </FieldGroup>
  )
}

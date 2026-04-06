'use client'

import { Controller, useFormContext, useFormState } from 'react-hook-form'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { RRSSManager } from '@/shared/components/rrss/rrss-manager'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon
} from '@/shared/components/ui/input-group'

import type { TeamMemberFormInput } from '../_schemas/organizacion.schema'

export function TeamMemberFormFields() {
  const { register, control } = useFormContext<TeamMemberFormInput>()
  const { errors } = useFormState({ control })

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='name'>
          Nombre <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='name'
          {...register('name')}
          placeholder='Nombre completo'
          aria-invalid={!!errors.name}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor='position'>Cargo</FieldLabel>
        <Input
          id='position'
          {...register('position')}
          placeholder='Ej. Director'
        />
      </Field>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='rut'>RUT</FieldLabel>
          <Input id='rut' {...register('rut')} placeholder='12.345.678-9' />
        </Field>
        <Field>
          <FieldLabel htmlFor='phone'>Teléfono</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='phone'
              {...register('phone')}
              placeholder='912345678'
            />
            <InputGroupAddon>+56</InputGroupAddon>
          </InputGroup>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor='email'>
          Email <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='email'
          type='email'
          {...register('email')}
          placeholder='correo@ejemplo.com'
          aria-invalid={!!errors.name}
        />
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <Controller
        name='rrss'
        control={control}
        render={({ field }) => (
          <RRSSManager values={field.value} onChange={field.onChange} />
        )}
      />
    </FieldGroup>
  )
}

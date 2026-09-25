import type { UseFormReturn } from 'react-hook-form'
import { Controller, useFormState } from 'react-hook-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { DatePickerField } from '@/shared/components/date-picker-field'
import { TimePickerField } from '@/shared/components/time-picker-field'
import type { ActivityFormInput } from '../_schemas/activity.schema'

export const EMPTY_REGISTRATION = {
  url: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: ''
}

export function clearRegistration(methods: UseFormReturn<ActivityFormInput>) {
  for (const name of [
    'url',
    'startDate',
    'startTime',
    'endDate',
    'endTime'
  ] as const) {
    methods.setValue(`registration.${name}`, '', { shouldDirty: true })
  }
  void methods.trigger('registration')
}

export function ActivityRegistrationFields({
  methods,
  disabled
}: {
  methods: UseFormReturn<ActivityFormInput>
  disabled: boolean
}) {
  const { errors } = useFormState({ control: methods.control })
  const registrationErrors = errors.registration

  return (
    <FieldGroup>
      <p className='text-sm font-medium'>
        Inscripción (opcional, horario de Chile)
      </p>
      <Field>
        <FieldLabel htmlFor='registration-url'>
          Enlace HTTPS de inscripción
        </FieldLabel>
        <Input
          id='registration-url'
          type='url'
          {...methods.register('registration.url')}
          disabled={disabled}
          aria-invalid={Boolean(registrationErrors?.url)}
        />
        {registrationErrors?.url && <FieldError>{registrationErrors.url.message}</FieldError>}
      </Field>
      <div className='grid grid-cols-2 gap-3'>
        <FieldGroup>
          <Controller
            name='registration.startDate'
            control={methods.control}
            render={({ field }) => (
              <DatePickerField
                id='registration-startDate'
                label='Inicio: fecha'
                value={field.value ?? ''}
                onChange={field.onChange}
                error={registrationErrors?.startDate?.message}
                disabled={disabled}
              />
            )}
          />
          <Controller
            name='registration.startTime'
            control={methods.control}
            render={({ field }) => (
              <TimePickerField
                id='registration-startTime'
                label='Inicio: hora'
                value={field.value ?? ''}
                onChange={field.onChange}
                error={registrationErrors?.startTime?.message}
                disabled={disabled}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            name='registration.endDate'
            control={methods.control}
            render={({ field }) => (
              <DatePickerField
                id='registration-endDate'
                label='Fin: fecha'
                value={field.value ?? ''}
                onChange={field.onChange}
                error={registrationErrors?.endDate?.message}
                disabled={disabled}
              />
            )}
          />
          <Controller
            name='registration.endTime'
            control={methods.control}
            render={({ field }) => (
              <TimePickerField
                id='registration-endTime'
                label='Fin: hora'
                value={field.value ?? ''}
                onChange={field.onChange}
                error={registrationErrors?.endTime?.message}
                disabled={disabled}
              />
            )}
          />
        </FieldGroup>
      </div>
    </FieldGroup>
  )
}
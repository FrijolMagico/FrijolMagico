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
  endTime: '',
  registrationEnabled: false
}

export function clearRegistration(methods: UseFormReturn<ActivityFormInput>) {
  for (const name of [
    'url',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'registrationEnabled'
  ] as const) {
    methods.setValue(`registration.${name}`, '', { shouldDirty: true })
  }
  // Set registrationEnabled to false explicitly
  methods.setValue('registration.registrationEnabled', false, {
    shouldDirty: true
  })
  void methods.trigger('registration')
}

function setDefaultTimeIfEmpty(
  methods: UseFormReturn<ActivityFormInput>,
  timeField: 'startTime' | 'endTime',
  dateValue: string
) {
  if (dateValue && !methods.getValues(`registration.${timeField}`)) {
    methods.setValue(`registration.${timeField}`, '00:00', {
      shouldDirty: true,
      shouldValidate: true
    })
  }
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
      <p className='font-medium'>Inscripción</p>
      <Field>
        <FieldLabel htmlFor='registration-url'>
          Enlace de inscripción <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='registration-url'
          type='url'
          {...methods.register('registration.url')}
          disabled={disabled}
          aria-invalid={Boolean(registrationErrors?.url)}
          required
        />
        {registrationErrors?.url && (
          <FieldError>{registrationErrors.url.message}</FieldError>
        )}
      </Field>
      <FieldGroup>
        <FieldLabel>
          Inicio <span className='text-destructive'>*</span>
        </FieldLabel>
        <div className='grid grid-cols-2 gap-3'>
          <Controller
            name='registration.startDate'
            control={methods.control}
            render={({ field }) => (
              <DatePickerField
                id='registration-startDate'
                value={field.value ?? ''}
                onChange={(value) => {
                  field.onChange(value)
                  setDefaultTimeIfEmpty(methods, 'startTime', value)
                }}
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
                value={field.value ?? ''}
                onChange={field.onChange}
                error={registrationErrors?.startTime?.message}
                disabled={disabled}
              />
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>
          Fin <span className='text-destructive'>*</span>
        </FieldLabel>
        <div className='grid grid-cols-2 gap-3'>
          <Controller
            name='registration.endDate'
            control={methods.control}
            render={({ field }) => (
              <DatePickerField
                id='registration-endDate'
                value={field.value ?? ''}
                onChange={(value) => {
                  field.onChange(value)
                  setDefaultTimeIfEmpty(methods, 'endTime', value)
                }}
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
                value={field.value ?? ''}
                onChange={field.onChange}
                error={registrationErrors?.endTime?.message}
                disabled={disabled}
              />
            )}
          />
        </div>
      </FieldGroup>
    </FieldGroup>
  )
}

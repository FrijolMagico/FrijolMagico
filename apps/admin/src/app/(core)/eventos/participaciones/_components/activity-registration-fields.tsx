import type { UseFormReturn } from 'react-hook-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
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
  const errors = methods.formState.errors.registration
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
          aria-invalid={Boolean(errors?.url)}
        />
        {errors?.url && <FieldError>{errors.url.message}</FieldError>}
      </Field>
      <div className='grid grid-cols-2 gap-3'>
        {(['start', 'end'] as const).map((boundary) => (
          <FieldGroup key={boundary}>
            {(['Date', 'Time'] as const).map((kind) => {
              const name = `registration.${boundary}${kind}` as const
              const error = errors?.[`${boundary}${kind}`]
              const label = `${boundary === 'start' ? 'Inicio' : 'Fin'}: ${kind === 'Date' ? 'fecha' : 'hora'}`
              return (
                <Field key={name}>
                  <FieldLabel htmlFor={name}>{label}</FieldLabel>
                  <Input
                    id={name}
                    type={kind === 'Date' ? 'date' : 'time'}
                    {...methods.register(name)}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                  />
                  {error && <FieldError>{error.message}</FieldError>}
                </Field>
              )
            })}
          </FieldGroup>
        ))}
      </div>
    </FieldGroup>
  )
}

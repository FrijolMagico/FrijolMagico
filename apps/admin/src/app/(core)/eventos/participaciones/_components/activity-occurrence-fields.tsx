'use client'

import { useState } from 'react'
import { Controller, useFieldArray, useFormState } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash
} from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { DatePickerField } from '@/shared/components/date-picker-field'
import { TimePickerField } from '@/shared/components/time-picker-field'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import type { ActivityFormInput } from '../_schemas/activity.schema'

export function ActivityOccurrenceFields({
  methods,
  disabled
}: {
  methods: UseFormReturn<ActivityFormInput>
  disabled: boolean
}) {
  const [date, setDate] = useState('')
  const [collapsed, setCollapsed] = useState<string[]>([])
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'occurrences'
  })
  const { errors } = useFormState({ control: methods.control })
  const dates = [...new Set(fields.map((field) => field.date))]

  const addSession = (selectedDate: string) => {
    append({ date: selectedDate, startTime: '', durationMinutes: 0 })
    setCollapsed((previous) => previous.filter((item) => item !== selectedDate))
  }

  const selectDate = (selectedDate: string) => {
    if (!selectedDate) return
    if (!fields.some((field) => field.date === selectedDate)) {
      addSession(selectedDate)
    } else {
      setCollapsed((previous) =>
        previous.filter((item) => item !== selectedDate)
      )
    }
    setDate('')
  }

  return (
    <section aria-label='Sesiones' className='space-y-3 rounded-md border p-3'>
      <h3 className='text-sm font-medium'>Sesiones (opcional)</h3>
      <DatePickerField
        id='occurrence-new-date'
        label='Fecha de nueva sesión'
        placeholder='Agregar día'
        value={date}
        onChange={selectDate}
        disabled={disabled}
      />
      <div className='max-h-64 space-y-2 overflow-y-auto'>
        {dates.map((currentDate) => {
          const indices = fields.flatMap((field, index) =>
            field.date === currentDate ? [index] : []
          )
          const hasErrors = indices.some((index) =>
            Boolean(errors.occurrences?.[index])
          )
          const expanded = hasErrors || !collapsed.includes(currentDate)
          const panelId = `occurrence-date-${currentDate}`
          return (
            <div key={currentDate} className='rounded-md border'>
              <div className='flex items-center gap-1 p-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='min-w-0 flex-1 justify-start'
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() =>
                    setCollapsed((previous) =>
                      expanded
                        ? [...previous, currentDate]
                        : previous.filter((item) => item !== currentDate)
                    )
                  }
                >
                  {expanded ? (
                    <IconChevronDown aria-hidden='true' />
                  ) : (
                    <IconChevronRight aria-hidden='true' />
                  )}
                  <span className='truncate'>
                    {format(new Date(currentDate + 'T00:00:00'), "d MMM yyyy", {
                      locale: es
                    })}
                  </span>
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={disabled}
                  aria-label={`Agregar sesión el ${currentDate}`}
                  title={`Agregar sesión el ${currentDate}`}
                  onClick={() => addSession(currentDate)}
                >
                  <IconPlus aria-hidden='true' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={disabled}
                  aria-label={`Quitar fecha ${currentDate}`}
                  title={`Quitar fecha ${currentDate}`}
                  onClick={() => {
                    remove(indices)
                    // Removing all sessions for this date -> clear picker so it can be re-added
                    setDate('')
                    setCollapsed((previous) =>
                      previous.filter((item) => item !== currentDate)
                    )
                  }}
                >
                  <IconTrash aria-hidden='true' />
                </Button>
              </div>
              <div
                id={panelId}
                hidden={!expanded}
                className='space-y-2 px-2 pb-2'
              >
                {indices.map((index, position) => {
                  const row = fields[index]
                  const rowErrors = errors.occurrences?.[index]
                  return (
                    <div key={row.id} className='space-y-1'>
                      {rowErrors?.date && (
                        <FieldError>{rowErrors.date.message}</FieldError>
                      )}
                      <div className='grid grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'>
                        <Controller
                          name={`occurrences.${index}.startTime`}
                          control={methods.control}
                          render={({ field }) => (
                            <TimePickerField
                              id={`occurrence-time-${row.id}`}
                              label='Inicio'
                              value={field.value ?? ''}
                              onChange={field.onChange}
                              error={rowErrors?.startTime?.message}
                              disabled={disabled}
                            />
                          )}
                        />
                        <Field>
                          <FieldLabel htmlFor={`occurrence-duration-${row.id}`}>
                            Duración (min)
                          </FieldLabel>
                          <Input
                            id={`occurrence-duration-${row.id}`}
                            type='number'
                            min={1}
                            step={1}
                            disabled={disabled}
                            aria-invalid={Boolean(rowErrors?.durationMinutes)}
                            aria-describedby={
                              rowErrors?.durationMinutes
                                ? `occurrence-duration-error-${row.id}`
                                : undefined
                            }
                            {...methods.register(
                              `occurrences.${index}.durationMinutes`,
                              { valueAsNumber: true }
                            )}
                          />
                          {rowErrors?.durationMinutes && (
                            <FieldError
                              id={`occurrence-duration-error-${row.id}`}
                            >
                              {rowErrors.durationMinutes.message}
                            </FieldError>
                          )}
                        </Field>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          disabled={disabled}
                          aria-label={`Quitar sesión ${position + 1} del ${currentDate}`}
                          title={`Quitar sesión ${position + 1} del ${currentDate}`}
                          onClick={() => {
                            remove(index)
                            if (indices.length === 1) {
                              // Last session for this date removed -> re-arm picker with this date
                              // so user can add it again
                              setDate(currentDate)
                              setCollapsed((previous) =>
                                previous.filter((item) => item !== currentDate)
                              )
                            } else {
                              // Still have sessions for this date -> re-arm picker with this date
                              setDate(currentDate)
                            }
                          }}
                        >
                          <IconTrash aria-hidden='true' />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

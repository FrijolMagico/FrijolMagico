'use client'

import { format, parse, isValid } from 'date-fns'
import { IconCalendar } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover'
import { cn } from '@/lib/utils'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'

interface DatePickerFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  error
}: DatePickerFieldProps) {
  const selectedDate = value
    ? parse(value, 'yyyy-MM-dd', new Date())
    : undefined

  const displayDate =
    selectedDate && isValid(selectedDate)
      ? format(selectedDate, 'dd/MM/yyyy')
      : null

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    onChange(format(date, 'yyyy-MM-dd'))
  }

  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !displayDate && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <IconCalendar className='mr-2 h-4 w-4 shrink-0' />
            {displayDate ?? 'Seleccionar fecha...'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={
              selectedDate && isValid(selectedDate) ? selectedDate : undefined
            }
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

'use client'

import { useState } from 'react'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { IconCalendar } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover'
import { cn } from '@/shared/lib/utils'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'

interface DatePickerFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
}

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  required,
  placeholder = 'Seleccionar fecha...'
}: DatePickerFieldProps) {
  const selectedDate = value
    ? parse(value, 'yyyy-MM-dd', new Date())
    : undefined

  const displayDate =
    selectedDate && isValid(selectedDate)
      ? format(selectedDate, "d MMM yyyy", { locale: es })
      : null

  const [open, setOpen] = useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    const formatted = format(date, 'yyyy-MM-dd')
    onChange(formatted)
    setOpen(false)
  }

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={id}>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </FieldLabel>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type='button'
              variant='outline'
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal',
                !displayDate && 'text-muted-foreground',
                error && 'border-destructive'
              )}
            >
              <IconCalendar className='mr-2 h-4 w-4 shrink-0' />
              <span className='truncate flex-1 min-w-0'>
                {displayDate ?? placeholder}
              </span>
            </Button>
          }
        />
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
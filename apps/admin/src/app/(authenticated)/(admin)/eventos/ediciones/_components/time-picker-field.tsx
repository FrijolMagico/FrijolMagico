'use client'

import { ClockIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { cn } from '@/lib/utils'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0')
)

interface TimePickerFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export function TimePickerField({
  id,
  label,
  value,
  onChange,
  error
}: TimePickerFieldProps) {
  const [hour = '', minute = ''] = value ? value.split(':') : []

  const displayValue = value ? `${hour}:${minute}` : null

  const handleHourChange = (h: string | null) => {
    if (!h) return
    const m = minute || '00'
    onChange(`${h}:${m}`)
  }

  const handleMinuteChange = (m: string | null) => {
    if (!m) return
    const h = hour || '00'
    onChange(`${h}:${m}`)
  }

  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type='button'
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal',
                !displayValue && 'text-muted-foreground',
                error && 'border-destructive'
              )}
            />
          }
        >
          <ClockIcon className='mr-2 h-4 w-4 shrink-0' />
          {displayValue ?? 'Seleccionar hora...'}
        </PopoverTrigger>
        <PopoverContent className='w-auto px-3 py-2' align='center'>
          <div className='flex items-center gap-2'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-xs'>Hora</span>
              <Select value={hour} onValueChange={handleHourChange}>
                <SelectTrigger className='w-18'>
                  <SelectValue placeholder='HH' />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-xs'>Minutos</span>
              <Select value={minute} onValueChange={handleMinuteChange}>
                <SelectTrigger className='w-18'>
                  <SelectValue placeholder='MM' />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

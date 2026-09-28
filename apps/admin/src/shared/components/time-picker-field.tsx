'use client'

import { useId, useState } from 'react'
import { IconClock } from '@tabler/icons-react'
import { cn } from '@/shared/lib/utils'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'

interface TimePickerFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

type Segment = 'hour' | 'minute'
function parts(value: string) {
  const separator = value.indexOf(':')
  return separator === -1
    ? { hour: value, minute: '' }
    : { hour: value.slice(0, separator), minute: value.slice(separator + 1) }
}

function segmentError(segment: Segment, text: string) {
  const name = segment === 'hour' ? 'La hora' : 'Los minutos'
  const max = segment === 'hour' ? 23 : 59
  if (!/^\d{0,2}$/.test(text) || (text.length === 2 && Number(text) > max))
    return `${name} debe estar entre ${segment === 'hour' ? '00 y 23' : '00 y 59'}`
  if (text.length !== 2) return `${name} debe tener dos dígitos`
  return undefined
}

export function TimePickerField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  required
}: TimePickerFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  // The form owns even incomplete drafts, so it cannot submit an earlier valid value.
  const { hour, minute } = parts(value)
  const hourError = value ? segmentError('hour', hour) : undefined
  const minuteError = value ? segmentError('minute', minute) : undefined
  const externalErrorId = `${fieldId}-error`
  const hourErrorId = `${fieldId}-hour-error`
  const minuteErrorId = `${fieldId}-minute-error`
  const [focusedSegment, setFocusedSegment] = useState<Segment | null>(null)

  const change = (segment: Segment, text: string) => {
    if (disabled) return
    // A complete paste replaces both segments. Malformed colon drafts must remain
    // visible and owned by the form rather than being silently truncated.
    if (text.includes(':')) {
      onChange(text)
      return
    }
    const next = { hour, minute, [segment]: text }
    onChange(
      next.hour === '' && next.minute === ''
        ? ''
        : `${next.hour}:${next.minute}`
    )
  }

  const step = (segment: Segment, amount: number) => {
    if (disabled) return
    const validHour = !segmentError('hour', hour)
    const validMinute = !segmentError('minute', minute)
    // Do not discard an incomplete or invalid draft on a step.
    if ((hour || minute) && (!validHour || !validMinute)) return
    const total =
      (validHour ? Number(hour) * 60 + Number(minute) : 0) +
      amount * (segment === 'hour' ? 60 : 1)
    const wrapped = ((total % 1440) + 1440) % 1440
    const nextHour = String(Math.floor(wrapped / 60)).padStart(2, '0')
    const nextMinute = String(wrapped % 60).padStart(2, '0')
    onChange(`${nextHour}:${nextMinute}`)
  }

  const handleWheel = (segment: Segment, event: React.WheelEvent) => {
    if (disabled) return
    // Only step when this segment is focused (native number input behavior).
    // If focusedSegment is null (no focus tracked yet, e.g., in tests),
    // allow events dispatched directly on this element.
    const target = event.currentTarget
    if (focusedSegment !== null && focusedSegment !== segment) return
    if (focusedSegment === null && event.target !== target) return
    event.preventDefault()
    step(segment, event.deltaY < 0 ? 1 : -1)
  }

  const handleKeyDown = (segment: Segment, event: React.KeyboardEvent) => {
    if (disabled) return
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Keyboard events only fire on focused elements natively.
      // If focusedSegment is null (no focus tracked yet, e.g., in tests),
      // allow events dispatched directly on this element.
      const target = event.currentTarget
      if (focusedSegment !== null && focusedSegment !== segment) return
      if (focusedSegment === null && event.target !== target) return
      event.preventDefault()
      step(segment, event.key === 'ArrowUp' ? 1 : -1)
    }
  }

  const handleFocus = (segment: Segment) => setFocusedSegment(segment)
  const handleBlur = () => setFocusedSegment(null)

  const hasError = Boolean(error || hourError || minuteError)

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={`${fieldId}-hour`}>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </FieldLabel>
      )}
      <div
        className={cn(
          'border-input flex h-9 w-full items-center gap-1 rounded-md border bg-transparent px-3 shadow-xs transition-[color,box-shadow] outline-none',
          'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-0',
          'placeholder:text-muted-foreground',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-input/30',
          hasError && 'border-destructive'
        )}
      >
        <IconClock
          aria-hidden='true'
          className='text-muted-foreground mr-2 size-4 shrink-0'
        />
        <input
          id={`${fieldId}-hour`}
          type='text'
          inputMode='numeric'
          autoComplete='off'
          aria-label={`${label ?? 'Hora'}: horas`}
          aria-invalid={Boolean(error || hourError)}
          aria-describedby={
            [error && externalErrorId, hourError && hourErrorId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          required={required}
          disabled={disabled}
          placeholder='HH'
          value={hour}
          onChange={(event) => change('hour', event.target.value)}
          onWheel={(event) => handleWheel('hour', event)}
          onKeyDown={(event) => handleKeyDown('hour', event)}
          onFocus={() => handleFocus('hour')}
          onBlur={handleBlur}
          className='w-8 min-w-0 bg-transparent text-center tabular-nums outline-none'
        />
        <span aria-hidden='true' className='text-muted-foreground'>
          :
        </span>
        <input
          id={`${fieldId}-minute`}
          type='text'
          inputMode='numeric'
          autoComplete='off'
          aria-label={`${label ?? 'Hora'}: minutos`}
          aria-invalid={Boolean(error || minuteError)}
          aria-describedby={
            [error && externalErrorId, minuteError && minuteErrorId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          required={required}
          disabled={disabled}
          placeholder='MM'
          value={minute}
          onChange={(event) => change('minute', event.target.value)}
          onWheel={(event) => handleWheel('minute', event)}
          onKeyDown={(event) => handleKeyDown('minute', event)}
          onFocus={() => handleFocus('minute')}
          onBlur={handleBlur}
          className='w-8 min-w-0 bg-transparent text-center tabular-nums outline-none'
        />
      </div>
      {hourError && <FieldError id={hourErrorId}>{hourError}</FieldError>}
      {minuteError && <FieldError id={minuteErrorId}>{minuteError}</FieldError>}
      {error && <FieldError id={externalErrorId}>{error}</FieldError>}
    </Field>
  )
}

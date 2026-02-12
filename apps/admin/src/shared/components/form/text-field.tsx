'use client'

import { useCallback } from 'react'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'

interface TextFieldProps {
  label: string
  field: string
  value: string
  onChange: (field: string, value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TextField({
  label,
  field,
  value,
  onChange,
  placeholder,
  disabled = false
}: TextFieldProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, e.target.value)
    },
    [field, onChange]
  )

  return (
    <div className='space-y-2'>
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className='w-full'
      />
    </div>
  )
}

'use client'

import { useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { OrganizacionFormData } from '../types/organizacion'

interface EditableTextFieldProps {
  label: string
  field: keyof Pick<OrganizacionFormData, 'nombre'>
  value: string
  onChange: (field: keyof OrganizacionFormData, value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function EditableTextField({
  label,
  field,
  value,
  onChange,
  placeholder,
  disabled = false
}: EditableTextFieldProps) {
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

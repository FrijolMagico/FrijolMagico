'use client'

import { useState } from 'react'
import { z } from 'zod'

interface UseFormFieldsOptions<T> {
  schema: z.ZodObject<Record<keyof T, z.ZodTypeAny>>
}

interface UseFormFieldsReturn<T> {
  fields: T
  setField: <K extends keyof T>(key: K, value: T[K]) => void
  isDirty: boolean
  dirtyFields: (keyof T)[]
  errors: Partial<Record<keyof T, string>>
  isValid: boolean
  reset: (next?: T) => void
}

export function useFormFields<T>(
  initial: T,
  options: UseFormFieldsOptions<T>
): UseFormFieldsReturn<T> {
  const { schema } = options

  const [fields, setFields] = useState<T>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const dirtyFields = (Object.keys(fields as string) as (keyof T)[]).filter(
    (key) => fields[key] !== initial[key]
  )

  const isDirty = dirtyFields.length > 0
  const isValid = Object.keys(errors).length === 0

  function setField<K extends keyof T>(key: K, value: T[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))

    const fieldSchema = schema.shape[key as keyof typeof schema.shape]

    if (fieldSchema) {
      const result = fieldSchema.safeParse(value)

      setErrors((prev) => {
        if (result.success) {
          const { [key]: _, ...rest } = prev // eslint-disable-line @typescript-eslint/no-unused-vars
          return rest as Partial<Record<keyof T, string>>
        }

        return {
          ...prev,
          [key]: result.error.issues[0]?.message
        }
      })
    }
  }

  function reset(next?: T) {
    setFields(next ?? initial)
    setErrors({})
  }

  return {
    fields,
    setField,
    isDirty,
    dirtyFields,
    errors,
    isValid,
    reset
  }
}

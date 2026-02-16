'use client'

import { useEffect, useState, Suspense } from 'react'
import { Label } from '@/shared/components/ui/label'
import { RichTextFieldDynamic } from './rich-text-field.dynamic'
import { RichTextFieldErrorBoundary } from './rich-text-field-error'
import { RichTextFieldSkeleton } from './rich-text-field.skeleton'
import { useStagedHydration } from './use-staged-hydration'

interface RichTextFieldContainerProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  priority?: 'high' | 'medium' | 'low'
  disabled?: boolean
}

export function RichTextFieldContainer({
  id,
  label,
  value,
  onChange,
  placeholder,
  minHeight,
  priority = 'medium',
  disabled
}: RichTextFieldContainerProps) {
  const { shouldRender } = useStagedHydration({ priority })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (shouldRender) {
      const timer = setTimeout(() => setIsReady(true), 0)
      return () => clearTimeout(timer)
    }
  }, [shouldRender])

  const handleUpdate = (newValue: string) => {
    if (!isReady) return
    onChange(newValue)
  }

  return (
    <div className='grid gap-2'>
      <Label htmlFor={id}>{label}</Label>

      {!shouldRender ? (
        <RichTextFieldSkeleton />
      ) : (
        <RichTextFieldErrorBoundary>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextFieldDynamic
              id={id}
              value={value}
              onChange={handleUpdate}
              placeholder={placeholder}
              minHeight={minHeight}
              disabled={disabled}
            />
          </Suspense>
        </RichTextFieldErrorBoundary>
      )}
    </div>
  )
}

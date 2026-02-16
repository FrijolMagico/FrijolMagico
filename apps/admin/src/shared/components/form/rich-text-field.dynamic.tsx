'use client'

import dynamic from 'next/dynamic'
import { RichTextFieldSkeleton } from './rich-text-field.skeleton'

export interface RichTextFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

export const RichTextFieldDynamic = dynamic(
  () => import('./rich-text-field').then((mod) => mod.RichTextField),
  {
    ssr: false,
    loading: () => <RichTextFieldSkeleton />
  }
)

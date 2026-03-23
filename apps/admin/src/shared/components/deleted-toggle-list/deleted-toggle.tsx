'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Badge } from '@/shared/components/ui/badge'
import { Toggle } from '@/shared/components/ui/toggle'

export interface DeletedToggleProps {
  showDeleted: boolean
  onToggle: () => void
  deletedCount: number
}

export function DeletedToggle({
  showDeleted,
  onToggle,
  deletedCount
}: DeletedToggleProps) {
  return (
    <Toggle
      pressed={showDeleted}
      aria-pressed={showDeleted}
      aria-label={showDeleted ? 'Ocultar eliminados' : 'Mostrar eliminados'}
      variant='outline'
      onPressedChange={() => onToggle()}
      className='gap-2'
    >
      {showDeleted ? <EyeOffIcon /> : <EyeIcon />}
      <span>{showDeleted ? 'Ocultar eliminados' : 'Mostrar eliminados'}</span>
      {deletedCount > 0 ? (
        <Badge variant={showDeleted ? 'secondary' : 'outline'}>
          {deletedCount}
        </Badge>
      ) : null}
    </Toggle>
  )
}

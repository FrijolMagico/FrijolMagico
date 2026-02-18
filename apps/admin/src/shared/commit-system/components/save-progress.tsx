'use client'

import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/lib/utils'

interface SaveProgressProps {
  current: number
  total: number
  className?: string
}

export function SaveProgress({ current, total, className }: SaveProgressProps) {
  // Batches pequeños son instantáneos, no mostramos progreso
  if (total < 50) return null

  const percentage = Math.min(Math.round((current / total) * 100), 100)

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className='text-muted-foreground flex items-center justify-between text-sm'>
        <span>Guardando cambios...</span>
        <span>
          Procesando {current} de {total}
        </span>
      </div>
      <Progress value={percentage} className='h-2 w-full' />
    </div>
  )
}

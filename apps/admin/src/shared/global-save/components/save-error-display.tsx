import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/shared/components/ui/alert'
import { buttonVariants } from '@/shared/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import type { CommitResult } from '@/shared/commit-system/lib/types'

export interface SaveErrorDisplayProps {
  result: CommitResult | null
}

const ERROR_TITLES: Record<string, string> = {
  VALIDATION_ERROR: 'Error de validación',
  DB_ERROR: 'Error de base de datos',
  NETWORK_ERROR: 'Error de conexión',
  UNKNOWN: 'Error desconocido'
}

export function SaveErrorDisplay({ result }: SaveErrorDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!result || result.success) {
    return null
  }

  const title = result.errors?.[0]?.code
    ? ERROR_TITLES[result.errors[0].code] || ERROR_TITLES.UNKNOWN
    : 'Error al guardar'

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <Alert
      variant='destructive'
      className='animate-in fade-in slide-in-from-top-2'
    >
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className='mt-2'>
        <div className='text-sm'>
          {isDev ? (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className='w-full space-y-2'
            >
              <div className='flex items-center justify-between'>
                <span>Ha ocurrido un problema al guardar los cambios.</span>
                <CollapsibleTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'hover:bg-destructive/20 h-6 w-6 p-0'
                  )}
                >
                  {isOpen ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                  <span className='sr-only'>Toggle details</span>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className='bg-destructive/10 mt-2 rounded-md p-2 font-mono text-xs'>
                  <p className='font-semibold'>Technical Details:</p>
                  {result.errors?.map((err, idx) => (
                    <p key={idx} className='break-all'>
                      {err.entityType}: {err.message}
                    </p>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <span>
              Ha ocurrido un problema inesperado. Por favor, inténtalo de nuevo
              más tarde.
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

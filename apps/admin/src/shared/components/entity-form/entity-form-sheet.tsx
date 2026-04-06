'use client'

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { IconPlus } from '@tabler/icons-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '../ui/sheet'

interface BaseSubmitButtonProps {
  disabled?: boolean
  isSubmitting?: boolean
  label?: string
}

type SheetSubmitProps = BaseSubmitButtonProps &
  (
    | {
        type?: 'submit'
        form: string
      }
    | {
        type?: 'button'
        onClick: () => void
      }
  )

interface EntityFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  isDirty?: boolean
  children: ReactNode
  className?: string
  triggerLabel?: string
  close?: {
    label?: string
    disabled?: boolean
  }
  submit?: SheetSubmitProps
}

export function EntityFormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  triggerLabel,
  close,
  submit,
  isDirty,
  className
}: EntityFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <SheetTrigger
          render={
            <Button size='sm' variant='outline'>
              <IconPlus />
              {triggerLabel}
            </Button>
          }
        />
      )}
      <SheetContent className={cn(className)}>
        {isDirty && (
          <Badge className='absolute -top-2 -left-6 ml-2 -rotate-6'>
            Editado
          </Badge>
        )}
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {children}

        {submit && (
          <SheetFooter>
            <SheetClose
              render={
                <Button variant='outline' disabled={close?.disabled}>
                  {close?.label ?? 'Cerrar'}
                </Button>
              }
            />
            {submit && (
              <Button
                type={submit.type === 'button' ? 'button' : 'submit'}
                form={submit.type === 'submit' ? submit.form : undefined}
                disabled={submit.disabled}
                onClick={submit.type === 'button' ? submit.onClick : undefined}
              >
                {submit.label
                  ? submit.label
                  : submit.isSubmitting
                    ? 'Guardando...'
                    : 'Guardar'}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

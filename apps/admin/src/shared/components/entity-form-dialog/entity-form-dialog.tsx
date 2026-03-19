'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { IconPlus } from '@tabler/icons-react'

interface EntityFormDialogProps {
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
  submit?: {
    form: string
    label?: string
    disabled?: boolean
    isSubmitting?: boolean
  }
}

export function EntityFormDialog({
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
}: EntityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <DialogTrigger
          render={
            <Button size='sm' variant='outline'>
              <IconPlus />
              {triggerLabel}
            </Button>
          }
        />
      )}
      <DialogContent className={cn(className)}>
        {isDirty && (
          <Badge className='absolute -top-2 -left-6 ml-2 -rotate-6'>
            Editado
          </Badge>
        )}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}

        {submit && (
          <DialogFooter>
            <DialogClose
              render={
                <Button variant='outline' disabled={close?.disabled}>
                  {close?.label ?? 'Cerrar'}
                </Button>
              }
            />
            {submit && (
              <Button
                type='submit'
                form={submit.form}
                disabled={submit.disabled}
              >
                {submit.label
                  ? submit.label
                  : submit.isSubmitting
                    ? 'Guardando...'
                    : 'Guardar'}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

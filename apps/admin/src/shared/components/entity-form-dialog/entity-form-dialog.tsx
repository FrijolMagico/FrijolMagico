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
import { cn } from '@/lib/utils'

interface EntityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  trigger?: ReactNode
  footer?: {
    close: ReactNode
    submit: ReactNode
  }
}

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
  footer,
  className
}: EntityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}

        {footer && (
          <DialogFooter>
            {footer.close && <DialogClose asChild>{footer.close}</DialogClose>}
            {footer.submit && footer.submit}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

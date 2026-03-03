'use client'

import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog'

interface PosterPreviewProps {
  isOpen: boolean
  posterUrl: string | null
  alt: string
  onClose: () => void
}

export function PosterPreview({ isOpen, posterUrl, alt, onClose }: PosterPreviewProps) {
  if (!posterUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none ring-0">
        <DialogTitle className="sr-only">Vista previa de poster</DialogTitle>
        <div className="relative flex items-center justify-center">
          <Image
            src={posterUrl}
            alt={alt}
            width={800}
            height={800}
            className="max-h-[80vh] max-w-full object-contain"
            unoptimized
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

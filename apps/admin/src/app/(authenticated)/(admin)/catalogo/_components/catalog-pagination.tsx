'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { useCatalogView } from '../_hooks/use-catalog-view'
import { useFilteredArtistCount } from '../_hooks/use-artist-ui'

interface CatalogPaginationProps {
  onPageChange: (page: number) => void
}

export function CatalogPagination({ onPageChange }: CatalogPaginationProps) {
  const { page, pageSize } = useCatalogView()
  const filteredCount = useFilteredArtistCount()

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize))
  const totalItems = filteredCount

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1)
    }
  }

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <>
      <Separator />
      <div className='flex items-center justify-between pt-4'>
        <p className='text-muted-foreground text-sm'>
          Mostrando {startItem}-{endItem} de {totalItems} artistas
        </p>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handlePrev}
            disabled={page === 1}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <div className='flex items-center gap-1'>
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className='text-muted-foreground/70 px-2'
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(pageNum as number)}
                  className='min-w-9'
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleNext}
            disabled={page === totalPages}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </>
  )
}

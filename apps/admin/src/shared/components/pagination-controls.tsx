'use client'

import type { ReactElement } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'

interface PaginationControlsProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  /** Label used in "Mostrando X-Y de Z {itemNoun}" — defaults to 'elementos' */
  itemNoun?: string
}

/**
 * Generic pagination UI component. Renders prev/next buttons, page number pills
 * with ellipsis logic, and an item range summary line.
 *
 * Returns `null` when `totalPages <= 1` — no pagination needed for a single page.
 *
 * Ported from `catalog-pagination.tsx` — made props-based so any feature can use it
 * without coupling to a specific Zustand store.
 *
 * @example
 * ```tsx
 * <PaginationControls
 *   page={page}
 *   pageSize={pageSize}
 *   totalItems={totalFilteredItems}
 *   onPageChange={setPage}
 *   itemNoun='artistas'
 * />
 * ```
 */
export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemNoun = 'elementos'
}: PaginationControlsProps): ReactElement | null {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalPages <= 1) return null

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

  const getPageNumbers = (): (number | string)[] => {
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

  return (
    <>
      <Separator />
      <div className='flex flex-col items-center justify-between gap-2 pt-4 md:flex-row'>
        <p className='text-muted-foreground text-sm'>
          Mostrando {startItem}-{endItem} de {totalItems} {itemNoun}
        </p>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handlePrev}
            disabled={page === 1}
          >
            <IconChevronLeft className='h-4 w-4' />
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
            <IconChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </>
  )
}

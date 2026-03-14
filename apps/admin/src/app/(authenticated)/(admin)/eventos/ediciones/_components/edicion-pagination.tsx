'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { useEdicionPaginationStore } from '../_store/edicion-pagination-store'

export function EdicionPagination({ totalItems }: { totalItems: number }) {
  const page = useEdicionPaginationStore((s) => s.page)
  const pageSize = useEdicionPaginationStore((s) => s.pageSize)
  const setPage = useEdicionPaginationStore((s) => s.setPage)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (page <= 3) {
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

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <>
      <Separator />
      <div className='flex flex-col items-center justify-between gap-2 pt-4 md:flex-row'>
        <p className='text-muted-foreground text-sm'>
          Mostrando {startItem}–{endItem} de {totalItems} ediciones
        </p>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage(page - 1)}
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
                  onClick={() => setPage(pageNum as number)}
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
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <IconChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </>
  )
}

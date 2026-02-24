'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'

type RRSSEntry = Record<string, string[]>

interface RRSSManagerProps {
  values: RRSSEntry | null
  onChange: (value: Record<string, string[]>) => void
  disabled?: boolean
}

export function RRSSManager({
  values,
  onChange,
  disabled = false
}: RRSSManagerProps) {
  const existingEntries = Object.entries(values ?? {}).flatMap(
    ([platform, urlList]) => {
      if (urlList.length === 0) return []

      return urlList.map((url) => ({
        id: crypto.randomUUID(),
        platform,
        url
      }))
    }
  )

  const [rows, setRows] = useState(existingEntries)

  // Existing entries handlers
  const handleUpdate = (id: string, newValue: Record<string, string>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...newValue } : row))
    )

    onChange(
      rows.reduce(
        (acc, row) => {
          if (row.id === id) {
            // Update the changed row
            const updatedRow = { ...row, ...newValue }
            if (!acc[updatedRow.platform]) {
              acc[updatedRow.platform] = []
            }
            acc[updatedRow.platform].push(updatedRow.url)
          } else {
            // Keep unchanged rows
            if (!acc[row.platform]) {
              acc[row.platform] = []
            }
            acc[row.platform].push(row.url)
          }
          return acc
        },
        {} as Record<string, string[]>
      )
    )
  }

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))

    onChange(
      rows.reduce(
        (acc, row) => {
          if (row.id === id) return acc // Skip the deleted row

          if (!acc[row.platform]) {
            acc[row.platform] = []
          }
          acc[row.platform].push(row.url)
          return acc
        },
        {} as Record<string, string[]>
      )
    )
  }

  // New rows handlers
  const handleAdd = () => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        platform: '',
        url: ''
      }
    ])
  }

  const hasEntries = rows.length > 0

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-medium'>Redes Sociales</div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleAdd}
          disabled={disabled}
          className='gap-2'
        >
          <Plus className='h-4 w-4' />
          Agregar red social
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-25'>Plataforma</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className='w-10 text-right'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasEntries && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className='text-muted-foreground h-24 text-center'
                >
                  Sin redes sociales
                </TableCell>
              </TableRow>
            )}

            {/* Existing Entries */}
            {rows.map(({ platform, url, id }) => (
              <TableRow key={platform}>
                <TableCell className='font-medium capitalize'>
                  <Input
                    value={platform}
                    onChange={(e) =>
                      handleUpdate(id, { platform: e.target.value })
                    }
                    disabled={disabled}
                    placeholder='Ej: Instagram'
                    className='h-8'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={url}
                    onChange={(e) => handleUpdate(id, { url: e.target.value })}
                    disabled={disabled}
                    placeholder='https://...'
                    className='h-8'
                  />
                </TableCell>
                <TableCell className='text-right'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => handleDelete(id)}
                    disabled={disabled}
                    className='text-destructive hover:text-destructive/90 h-8 w-8'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

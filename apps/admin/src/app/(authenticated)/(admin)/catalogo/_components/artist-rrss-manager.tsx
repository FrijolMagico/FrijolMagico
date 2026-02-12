'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

interface RRSSEntry {
  id: string
  platform: string
  url: string
  isNew: boolean
}

interface ArtistRRSSManagerProps {
  initialValue: { [key: string]: string } | null
  onChange: (value: { [key: string]: string }) => void
}

export function ArtistRRSSManager({
  initialValue,
  onChange
}: ArtistRRSSManagerProps) {
  const [rrssEntries, setRrssEntries] = useState<RRSSEntry[]>([])

  useEffect(() => {
    if (initialValue) {
      const entries = Object.entries(initialValue).map(([platform, url]) => ({
        id: crypto.randomUUID(),
        platform,
        url: String(url),
        isNew: false
      }))
      setRrssEntries(entries)
    } else {
      setRrssEntries([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const rrssObject = rrssEntries.reduce(
      (acc, entry) => {
        if (entry.platform.trim() && entry.url.trim()) {
          acc[entry.platform.trim()] = entry.url.trim()
        }
        return acc
      },
      {} as Record<string, string>
    )

    onChange(rrssObject)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rrssEntries])

  const addEntry = () => {
    setRrssEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), platform: '', url: '', isNew: true }
    ])
  }

  const removeEntry = (id: string) => {
    setRrssEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const updateEntry = (
    id: string,
    field: 'platform' | 'url',
    value: string
  ) => {
    setRrssEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label>Redes Sociales</Label>
        <Button
          variant='ghost'
          size='icon'
          onClick={addEntry}
          type='button'
          className='h-8 w-8'
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plataforma</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rrssEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className='text-muted-foreground h-24 text-center'
                >
                  Sin redes sociales
                </TableCell>
              </TableRow>
            ) : (
              rrssEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.isNew ? (
                      <Input
                        value={entry.platform}
                        onChange={(e) =>
                          updateEntry(entry.id, 'platform', e.target.value)
                        }
                        placeholder='Ej. Instagram'
                        className='h-8'
                      />
                    ) : (
                      <span className='text-sm font-medium capitalize'>
                        {entry.platform}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={entry.url}
                      onChange={(e) =>
                        updateEntry(entry.id, 'url', e.target.value)
                      }
                      placeholder='https://...'
                      className='h-8'
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => removeEntry(entry.id)}
                      className='text-destructive hover:text-destructive/90 h-8 w-8'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

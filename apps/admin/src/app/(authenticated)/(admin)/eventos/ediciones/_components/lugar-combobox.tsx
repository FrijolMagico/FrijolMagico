'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, MapPinPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  useLugarOperationStore,
  useLugarProjectionStore
} from '../_store/lugar-ui-store'

interface LugarComboboxProps {
  value: string | null
  onChange: (id: string | null) => void
}

interface LugarFormState {
  nombre: string
  direccion: string
  ciudad: string
  url: string
}

const INITIAL_LUGAR_FORM_STATE: LugarFormState = {
  nombre: '',
  direccion: '',
  ciudad: '',
  url: ''
}

export function LugarCombobox({ value, onChange }: LugarComboboxProps) {
  const addLugar = useLugarOperationStore((s) => s.add)
  const lugaresById = useLugarProjectionStore((s) => s.byId)
  const lugarIds = useLugarProjectionStore((s) => s.allIds)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newLugar, setNewLugar] = useState<LugarFormState>(
    INITIAL_LUGAR_FORM_STATE
  )

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false)
        setShowCreateForm(false)
        setSearch('')
        setCreateError(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const lugares = lugarIds
    .map((id) => lugaresById[id])
    .filter((lugar) => !!lugar && !lugar.__meta?.isDeleted)

  const term = search.trim().toLowerCase()
  const filteredLugares = !term
    ? lugares
    : lugares.filter((lugar) => {
        const searchable = [lugar.nombre, lugar.direccion, lugar.ciudad]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(term)
      })

  const selectedLugar = value ? lugaresById[value] : null

  const handleSelect = (id: string | null) => {
    onChange(id)
    setIsOpen(false)
    setShowCreateForm(false)
    setSearch('')
    setCreateError(null)
  }

  const handleCreateLugar = () => {
    const nombre = newLugar.nombre.trim()

    if (!nombre) {
      setCreateError('El nombre es obligatorio')
      return
    }

    const previousOperations = useLugarOperationStore.getState().operations ?? []

    const now = new Date().toISOString()

    addLugar({
      nombre,
      direccion: newLugar.direccion.trim() || null,
      ciudad: newLugar.ciudad.trim() || null,
      url: newLugar.url.trim() || null,
      coordenadas: null,
      createdAt: now,
      updatedAt: now
    })

    const nextOperations = useLugarOperationStore.getState().operations ?? []
    const latestOperation = nextOperations[nextOperations.length - 1]

    const didAddNewLugar =
      latestOperation?.type === 'ADD' &&
      nextOperations.length > previousOperations.length

    if (didAddNewLugar) {
      onChange(latestOperation.id)
    }

    setShowCreateForm(false)
    setSearch('')
    setCreateError(null)
    setNewLugar(INITIAL_LUGAR_FORM_STATE)
    setIsOpen(false)
  }

  return (
    <div className='relative' ref={containerRef}>
      <Button
        type='button'
        variant='outline'
        className='w-full justify-between'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className='truncate text-left'>
          {selectedLugar?.nombre ?? 'Seleccionar lugar...'}
        </span>
        <ChevronDown className='h-4 w-4 shrink-0 opacity-60' />
      </Button>

      {isOpen && (
        <div className='bg-popover border-border absolute z-50 mt-2 w-full rounded-md border p-2 shadow-md'>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Buscar lugar...'
            className='mb-2'
          />

          <div className='max-h-52 space-y-1 overflow-y-auto'>
            <button
              type='button'
              className={cn(
                'hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm',
                !value && 'bg-accent text-accent-foreground'
              )}
              onClick={() => handleSelect(null)}
            >
              <span className='truncate'>Sin lugar</span>
              {!value && <Check className='h-4 w-4' />}
            </button>

            {filteredLugares.length === 0 ? (
              <div className='text-muted-foreground px-2 py-2 text-sm'>
                No hay lugares que coincidan
              </div>
            ) : (
              filteredLugares.map((lugar) => (
                <button
                  key={lugar.id}
                  type='button'
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm',
                    value === lugar.id && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => handleSelect(lugar.id)}
                >
                  <span className='truncate'>{lugar.nombre}</span>
                  {value === lugar.id && <Check className='h-4 w-4' />}
                </button>
              ))
            )}
          </div>

          <div className='mt-2 border-t pt-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='w-full justify-start'
              onClick={() => {
                setShowCreateForm((prev) => !prev)
                setCreateError(null)
              }}
            >
              <MapPinPlus className='mr-2 h-4 w-4' />
              Crear nuevo lugar
            </Button>
          </div>

          {showCreateForm && (
            <div className='bg-muted/50 mt-2 space-y-2 rounded-md border p-3'>
              <div className='grid gap-1'>
                <Label htmlFor='lugar-nombre'>Nombre</Label>
                <Input
                  id='lugar-nombre'
                  value={newLugar.nombre}
                  onChange={(e) => {
                    setCreateError(null)
                    setNewLugar((prev) => ({ ...prev, nombre: e.target.value }))
                  }}
                  placeholder='Ej. Centro Cultural GAM'
                />
                {createError && (
                  <p className='text-destructive text-xs'>{createError}</p>
                )}
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='lugar-direccion'>Dirección</Label>
                <Input
                  id='lugar-direccion'
                  value={newLugar.direccion}
                  onChange={(e) =>
                    setNewLugar((prev) => ({
                      ...prev,
                      direccion: e.target.value
                    }))
                  }
                  placeholder='Av. Libertador Bernardo O’Higgins 227'
                />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='lugar-ciudad'>Ciudad</Label>
                <Input
                  id='lugar-ciudad'
                  value={newLugar.ciudad}
                  onChange={(e) =>
                    setNewLugar((prev) => ({ ...prev, ciudad: e.target.value }))
                  }
                  placeholder='Santiago'
                />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='lugar-url'>URL</Label>
                <Input
                  id='lugar-url'
                  value={newLugar.url}
                  onChange={(e) =>
                    setNewLugar((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder='https://...'
                />
              </div>

              <div className='flex justify-end gap-2 pt-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setShowCreateForm(false)
                    setCreateError(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type='button' size='sm' onClick={handleCreateLugar}>
                  Crear
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

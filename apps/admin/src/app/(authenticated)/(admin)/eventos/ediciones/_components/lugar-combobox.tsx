'use client'

import { useState } from 'react'
import { MapPinPlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator
} from '@/shared/components/ui/combobox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  useLugarOperationStore,
  useLugarProjectionStore
} from '../_store/lugar-ui-store'

// Base UI Combobox automatically uses { value, label } shape:
// - `label` is shown in the input
// - `value` is used for form submission
// Sentinel value represents "no place selected" (null in the DB)
const NULL_LUGAR_VALUE = null

type LugarItem = { value: string | null; label: string }

const NULL_LUGAR_ITEM: LugarItem = {
  value: NULL_LUGAR_VALUE,
  label: 'Sin lugar'
}

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

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newLugar, setNewLugar] = useState<LugarFormState>(
    INITIAL_LUGAR_FORM_STATE
  )

  const items: LugarItem[] = [
    NULL_LUGAR_ITEM,
    ...lugarIds
      .map((id) => ({ id, lugar: lugaresById[id] }))
      .filter(({ lugar }) => !!lugar && !lugar.__meta?.isDeleted)
      .map(({ id, lugar }) => ({ value: id, label: lugar!.nombre }))
  ]

  const comboboxValue: LugarItem =
    value !== null
      ? (items.find((i) => i.value === value) ?? NULL_LUGAR_ITEM)
      : NULL_LUGAR_ITEM

  const handleValueChange = (selected: LugarItem | null) => {
    const raw = selected?.value
    const id = raw && raw !== NULL_LUGAR_VALUE ? raw : null
    onChange(id)
    setShowCreateForm(false)
    setCreateError(null)
  }

  const handleCreateLugar = () => {
    const nombre = newLugar.nombre.trim()

    if (!nombre) {
      setCreateError('El nombre es obligatorio')
      return
    }

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

    setShowCreateForm(false)
    setCreateError(null)
    setNewLugar(INITIAL_LUGAR_FORM_STATE)
  }

  return (
    <Combobox
      items={items}
      value={comboboxValue}
      onValueChange={handleValueChange}
      isItemEqualToValue={(item, val) => item.value === val.value}
    >
      <ComboboxInput placeholder='Seleccionar lugar...' showTrigger />
      <ComboboxContent>
        <ComboboxEmpty>No hay lugares que coincidan</ComboboxEmpty>

        {showCreateForm ? (
          <div className='space-y-2 p-3'>
            <div className='grid gap-1'>
              <Label htmlFor='lugar-nombre'>Nombre</Label>
              <Input
                id='lugar-nombre'
                value={newLugar.nombre}
                onChange={(e) => {
                  setCreateError(null)
                  setNewLugar((prev) => ({
                    ...prev,
                    nombre: e.target.value
                  }))
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
                placeholder="Av. Libertador Bernardo O'Higgins 227"
              />
            </div>

            <div className='grid gap-1'>
              <Label htmlFor='lugar-ciudad'>Ciudad</Label>
              <Input
                id='lugar-ciudad'
                value={newLugar.ciudad}
                onChange={(e) =>
                  setNewLugar((prev) => ({
                    ...prev,
                    ciudad: e.target.value
                  }))
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
                  setNewLugar(INITIAL_LUGAR_FORM_STATE)
                }}
              >
                Cancelar
              </Button>
              <Button type='button' size='sm' onClick={handleCreateLugar}>
                Crear
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ComboboxList>
              {items.map((item) => (
                <ComboboxItem key={item.value ?? 'none'} value={item}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>

            <ComboboxSeparator />

            <div className='p-1'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='w-full justify-start font-normal'
                onClick={() => {
                  setShowCreateForm((prev) => !prev)
                  setCreateError(null)
                }}
              >
                <MapPinPlus className='mr-2 h-4 w-4' />
                Crear nuevo lugar
              </Button>
            </div>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  )
}

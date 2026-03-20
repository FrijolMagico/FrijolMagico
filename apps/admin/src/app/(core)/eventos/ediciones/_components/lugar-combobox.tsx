'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconMapPinPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { addLugarAction } from '../_actions/add-lugar.action'
import type { Place } from '../_schemas/edicion.schema'
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

const NULL_LUGAR_VALUE = null

type LugarItem = { value: number | null; label: string }

const NULL_LUGAR_ITEM: LugarItem = {
  value: NULL_LUGAR_VALUE,
  label: 'Sin lugar'
}

interface LugarComboboxProps {
  value: number | null
  onChange: (id: number | null) => void
  lugares: Place[]
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

export function LugarCombobox({
  value,
  onChange,
  lugares
}: LugarComboboxProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newLugar, setNewLugar] = useState<LugarFormState>(
    INITIAL_LUGAR_FORM_STATE
  )

  const items: LugarItem[] = [
    NULL_LUGAR_ITEM,
    ...lugares.map((lugar) => ({ value: lugar.id, label: lugar.nombre }))
  ]

  const comboboxValue: LugarItem =
    value !== null
      ? (items.find((item) => item.value === value) ?? NULL_LUGAR_ITEM)
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

    startTransition(async () => {
      const formData = new FormData()
      formData.append('nombre', nombre)
      if (newLugar.direccion) formData.append('direccion', newLugar.direccion)
      if (newLugar.ciudad) formData.append('ciudad', newLugar.ciudad)
      if (newLugar.url) formData.append('url', newLugar.url)

      const result = await addLugarAction({ success: false }, formData)

      if (!result.success && result.errors) {
        setCreateError(result.errors[0]?.message ?? 'Error al crear lugar')
      } else if (result.success && result.data) {
        toast.success('Lugar creado')
        onChange(result.data.id)
        setShowCreateForm(false)
        setCreateError(null)
        setNewLugar(INITIAL_LUGAR_FORM_STATE)
        router.refresh()
      }
    })
  }

  return (
    <Combobox
      items={items}
      value={comboboxValue}
      onValueChange={handleValueChange}
      isItemEqualToValue={(item, selected) => item.value === selected.value}
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
                onChange={(event) => {
                  setCreateError(null)
                  setNewLugar((prev) => ({
                    ...prev,
                    nombre: event.target.value
                  }))
                }}
                placeholder='Ej. Centro Cultural GAM'
                disabled={isPending}
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
                onChange={(event) =>
                  setNewLugar((prev) => ({
                    ...prev,
                    direccion: event.target.value
                  }))
                }
                placeholder="Av. Libertador Bernardo O'Higgins 227"
                disabled={isPending}
              />
            </div>

            <div className='grid gap-1'>
              <Label htmlFor='lugar-ciudad'>Ciudad</Label>
              <Input
                id='lugar-ciudad'
                value={newLugar.ciudad}
                onChange={(event) =>
                  setNewLugar((prev) => ({
                    ...prev,
                    ciudad: event.target.value
                  }))
                }
                placeholder='Santiago'
                disabled={isPending}
              />
            </div>

            <div className='grid gap-1'>
              <Label htmlFor='lugar-url'>URL</Label>
              <Input
                id='lugar-url'
                value={newLugar.url}
                onChange={(event) =>
                  setNewLugar((prev) => ({ ...prev, url: event.target.value }))
                }
                placeholder='https://...'
                disabled={isPending}
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
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type='button'
                size='sm'
                onClick={handleCreateLugar}
                disabled={isPending}
              >
                {isPending ? 'Creando...' : 'Crear'}
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
                <IconMapPinPlus className='mr-2 h-4 w-4' />
                Crear nuevo lugar
              </Button>
            </div>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  )
}

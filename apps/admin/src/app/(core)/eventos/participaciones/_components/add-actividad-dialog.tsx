'use client'

import { useActionState, useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { ActionState } from '@/shared/types/actions'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { addActividadAction } from '../_actions/actividades/add-actividad.action'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'

const PARTICIPANT_TYPE = {
  ARTISTA: 'artista',
  AGRUPACION: 'agrupacion',
  BANDA: 'banda'
} as const

const MUSICA_ACTIVITY_TYPE_ID = '3'

type DialogParticipantType =
  (typeof PARTICIPANT_TYPE)[keyof typeof PARTICIPANT_TYPE]

interface DialogArtistaOption {
  id: number
  pseudonimo: string
  nombre: string | null
  estadoSlug: string
}

interface DialogAgrupacionOption {
  id: number
  nombre: string
}

interface DialogBandOption {
  id: number
  name: string
}

interface DialogTipoActividadOption {
  id: number
  slug: string
}

interface AddActividadDialogProps {
  edicionId: number
  artistas: DialogArtistaOption[]
  agrupaciones: DialogAgrupacionOption[]
  bandas: DialogBandOption[]
  tiposActividad: DialogTipoActividadOption[]
}

export function AddActividadDialog({
  edicionId,
  artistas,
  agrupaciones,
  bandas,
  tiposActividad
}: AddActividadDialogProps) {
  const { isAddActividadDialogOpen, setAddActividadDialogOpen } =
    useParticipacionesViewStore()

  const [tipo, setTipo] = useState<DialogParticipantType>(PARTICIPANT_TYPE.ARTISTA)
  const [selectedArtistaId, setSelectedArtistaId] = useState('')
  const [selectedAgrupacionId, setSelectedAgrupacionId] = useState('')
  const [selectedBandaId, setSelectedBandaId] = useState('')
  const [selectedTipoActividadId, setSelectedTipoActividadId] = useState('')

  const resetFormState = () => {
    setTipo(PARTICIPANT_TYPE.ARTISTA)
    setSelectedArtistaId('')
    setSelectedAgrupacionId('')
    setSelectedBandaId('')
    setSelectedTipoActividadId('')
  }

  const handleOpenChange = (open: boolean) => {
    setAddActividadDialogOpen(open)
    if (!open) {
      resetFormState()
    }
  }

  const handleTipoChange = (value: string | null) => {
    if (!value) {
      return
    }

    const nextTipo = value as DialogParticipantType

    setTipo(nextTipo)

    if (nextTipo === PARTICIPANT_TYPE.BANDA) {
      setSelectedArtistaId('')
      setSelectedAgrupacionId('')
      setSelectedTipoActividadId(MUSICA_ACTIVITY_TYPE_ID)
      return
    }

    setSelectedBandaId('')
  }

  const handleArtistaChange = (value: string | null) => {
    setSelectedArtistaId(value ?? '')
  }

  const handleAgrupacionChange = (value: string | null) => {
    setSelectedAgrupacionId(value ?? '')
  }

  const handleBandaChange = (value: string | null) => {
    setSelectedBandaId(value ?? '')
  }

  const handleTipoActividadChange = (value: string | null) => {
    setSelectedTipoActividadId(value ?? '')
  }

  const [, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addActividadAction(prevState, formData)

      if (result.success) {
        toast.success('Actividad agregada correctamente')
        handleOpenChange(false)
      } else {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al agregar actividad'
        )
      }
      return result
    },
    { success: false }
  )

  const musicaOption = tiposActividad.find(
    (tipoActividad) => tipoActividad.id === Number(MUSICA_ACTIVITY_TYPE_ID)
  )

  return (
    <Dialog open={isAddActividadDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-md overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Agregar Actividad</DialogTitle>
          <DialogDescription>
            Añade un participante a una actividad específica en esta edición.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className='flex flex-col gap-4'>
          <input type='hidden' name='eventoEdicionId' value={String(edicionId)} />
          <input type='hidden' name='artistaId' value={selectedArtistaId} />
          <input type='hidden' name='agrupacionId' value={selectedAgrupacionId} />
          <input type='hidden' name='bandaId' value={selectedBandaId} />
          <input
            type='hidden'
            name='tipoActividadId'
            value={
              tipo === PARTICIPANT_TYPE.BANDA
                ? MUSICA_ACTIVITY_TYPE_ID
                : selectedTipoActividadId
            }
          />

          <div className='flex flex-col gap-2'>
            <Label>Tipo de Participante</Label>
            <Select
              value={tipo}
              onValueChange={handleTipoChange}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PARTICIPANT_TYPE.ARTISTA}>
                  Artista Individual
                </SelectItem>
                <SelectItem value={PARTICIPANT_TYPE.AGRUPACION}>
                  Agrupación
                </SelectItem>
                <SelectItem value={PARTICIPANT_TYPE.BANDA}>Banda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === PARTICIPANT_TYPE.ARTISTA && (
            <div className='flex flex-col gap-2'>
              <Label>Artista</Label>
              <Select
                value={selectedArtistaId}
                onValueChange={handleArtistaChange}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar artista' />
                </SelectTrigger>
                <SelectContent>
                  {artistas
                    .filter((artista) => artista.estadoSlug !== 'vetado')
                    .map((artista) => (
                      <SelectItem
                        key={artista.id}
                        value={String(artista.id)}
                      >
                        {artista.pseudonimo} ({artista.nombre ?? 'Sin nombre'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === PARTICIPANT_TYPE.AGRUPACION && (
            <div className='flex flex-col gap-2'>
              <Label>Agrupación</Label>
              <Select
                value={selectedAgrupacionId}
                onValueChange={handleAgrupacionChange}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar agrupación' />
                </SelectTrigger>
                <SelectContent>
                  {agrupaciones.map((agrupacion) => (
                    <SelectItem
                      key={agrupacion.id}
                      value={String(agrupacion.id)}
                    >
                      {agrupacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === PARTICIPANT_TYPE.BANDA && (
            <div className='flex flex-col gap-2'>
              <Label>Banda</Label>
              <Select
                value={selectedBandaId}
                onValueChange={handleBandaChange}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar banda' />
                </SelectTrigger>
                <SelectContent>
                  {bandas.map((banda) => (
                    <SelectItem key={banda.id} value={String(banda.id)}>
                      {banda.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <Label>Tipo de Actividad</Label>
            <Select
              value={
                tipo === PARTICIPANT_TYPE.BANDA
                  ? MUSICA_ACTIVITY_TYPE_ID
                  : selectedTipoActividadId
              }
              onValueChange={handleTipoActividadChange}
              disabled={isPending || tipo === PARTICIPANT_TYPE.BANDA}
            >
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar tipo de actividad' />
              </SelectTrigger>
              <SelectContent>
                {(tipo === PARTICIPANT_TYPE.BANDA
                  ? tiposActividad.filter(
                      (tipoActividad) =>
                        tipoActividad.id === Number(MUSICA_ACTIVITY_TYPE_ID)
                    )
                  : tiposActividad
                ).map((tipoActividad) => (
                  <SelectItem
                    key={tipoActividad.id}
                    value={String(tipoActividad.id)}
                  >
                    {tipoActividad.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tipo === PARTICIPANT_TYPE.BANDA && musicaOption && (
              <p className='text-muted-foreground text-xs'>
                Las bandas solo pueden participar en actividades de tipo{' '}
                {musicaOption.slug}.
              </p>
            )}
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Notas Internas (opcional)</Label>
            <Textarea
              name='notas'
              placeholder='Notas sobre esta participación...'
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className='bg-border my-2 h-px w-full' />

          <h4 className='text-foreground text-sm font-medium'>
            Detalles de la Actividad (Público)
          </h4>

          <div className='flex flex-col gap-2'>
            <Label>Título de la Actividad</Label>
            <Input
              name='titulo'
              placeholder='Ej: Taller de Ilustración'
              disabled={isPending}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Descripción Pública (opcional)</Label>
            <Textarea
              name='descripcion'
              placeholder='De qué trata la actividad...'
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Duración (minutos)</Label>
              <Input
                name='duracionMinutos'
                type='number'
                placeholder='Ej: 90'
                disabled={isPending}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Cupos Totales</Label>
              <Input
                name='cupos'
                type='number'
                placeholder='Ej: 30'
                disabled={isPending}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Hora Inicio</Label>
              <Input name='horaInicio' type='time' disabled={isPending} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Ubicación</Label>
              <Input
                name='ubicacion'
                placeholder='Ej: Sala 3'
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter className='mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && (
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Agregar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

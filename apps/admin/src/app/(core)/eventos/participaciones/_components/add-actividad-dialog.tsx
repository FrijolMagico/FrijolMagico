'use client'

import { useState, useActionState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'
import type { ParticipacionesData } from '../_lib/get-participaciones-data'
import { addActividadAction } from '../_actions/actividades/add-actividad.action'
import { IconLoader2 } from '@tabler/icons-react'
import { ActionState } from '@/shared/types/actions'

interface AddActividadDialogProps {
  edicionId: string
  artistas: ParticipacionesData['artistas']
  agrupaciones: ParticipacionesData['agrupaciones']
  tiposActividad: ParticipacionesData['tiposActividad']
}

export function AddActividadDialog({
  edicionId,
  artistas,
  agrupaciones,
  tiposActividad
}: AddActividadDialogProps) {
  const { isAddActividadDialogOpen, setAddActividadDialogOpen } =
    useParticipacionesViewStore()

  const [tipo, setTipo] = useState<'artista' | 'agrupacion'>('artista')

  const [, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addActividadAction(prevState, formData)

      if (result.success) {
        toast.success('Actividad agregada correctamente')
        setAddActividadDialogOpen(false)
        setTipo('artista')
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

  const handleOpenChange = (open: boolean) => {
    setAddActividadDialogOpen(open)
    if (!open) {
      setTipo('artista')
    }
  }

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
          <input type='hidden' name='eventoEdicionId' value={edicionId} />

          <div className='flex flex-col gap-2'>
            <Label>Tipo de Participante</Label>
            <Select
              value={tipo}
              onValueChange={(val) => setTipo(val as 'artista' | 'agrupacion')}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='artista'>Artista Individual</SelectItem>
                <SelectItem value='agrupacion'>Agrupación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === 'artista' ? (
            <div className='flex flex-col gap-2'>
              <Label>Artista</Label>
              <Select name='artistaId' disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar artista' />
                </SelectTrigger>
                <SelectContent>
                  {artistas
                    .filter((a) => a.estadoSlug !== 'vetado')
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.pseudonimo} ({a.nombre ?? 'Sin nombre'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              <Label>Agrupación</Label>
              <Select name='agrupacionId' disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar agrupación' />
                </SelectTrigger>
                <SelectContent>
                  {agrupaciones.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='flex flex-col gap-2'>
            <Label>Tipo de Actividad</Label>
            <Select name='tipoActividadId' disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar tipo de actividad' />
              </SelectTrigger>
              <SelectContent>
                {tiposActividad.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

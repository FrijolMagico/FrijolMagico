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
import { addExpositorAction } from '../_actions/expositores/add-expositor.action'
import { IconLoader2 } from '@tabler/icons-react'
import { ActionState } from '@/shared/types/actions'

interface AddExpositorDialogProps {
  edicionId: string
  artistas: ParticipacionesData['artistas']
  agrupaciones: ParticipacionesData['agrupaciones']
  disciplinas: ParticipacionesData['disciplinas']
}

export function AddExpositorDialog({
  edicionId,
  artistas,
  agrupaciones,
  disciplinas
}: AddExpositorDialogProps) {
  const { isAddExpositorDialogOpen, setAddExpositorDialogOpen } =
    useParticipacionesViewStore()

  const [tipo, setTipo] = useState<'artista' | 'agrupacion'>('artista')

  const [, formAction, isPending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addExpositorAction(prevState, formData)

      if (result.success) {
        toast.success('Expositor agregado correctamente')
        setAddExpositorDialogOpen(false)
        setTipo('artista')
      } else {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al agregar expositor'
        )
      }
      return result
    },
    { success: false }
  )

  const handleOpenChange = (open: boolean) => {
    setAddExpositorDialogOpen(open)
    if (!open) {
      setTipo('artista')
    }
  }

  return (
    <Dialog open={isAddExpositorDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Agregar Expositor</DialogTitle>
          <DialogDescription>
            Añade un artista o agrupación como expositor a esta edición.
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
            <Label>Disciplina</Label>
            <Select name='disciplinaId' disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder='Seleccionar disciplina' />
              </SelectTrigger>
              <SelectContent>
                {disciplinas.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Notas (opcional)</Label>
            <Textarea
              name='notas'
              placeholder='Notas sobre el expositor...'
              rows={2}
              disabled={isPending}
            />
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

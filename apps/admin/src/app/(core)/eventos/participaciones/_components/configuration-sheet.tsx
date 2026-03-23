'use client'

import { useState, useTransition } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/shared/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/shared/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { useParticipacionesViewStore } from '../_store/participaciones-view-store'
import type {
  ComposedActividad,
  ComposedExposicion,
  ParticipationStatus
} from '../_types'
import { updateExpositorAction } from '../_actions/update-expositor.action'
import { updateActividadAction } from '../_actions/update-actividad.action'
import { updateDetallesAction } from '../_actions/update-detalles.action'
import type { ParticipacionesViewData } from '../_types'

interface ConfigurationSheetProps {
  data: ParticipacionesViewData
}

const ESTADO_OPCIONES: { value: ParticipationStatus; label: string }[] = [
  { value: 'seleccionado', label: 'Seleccionado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'desistido', label: 'Desistido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'completado', label: 'Completado' }
]

export function ConfigurationSheet({ data }: ConfigurationSheetProps) {
  const [removeExpositorOpen, setRemoveExpositorOpen] = useState(false)
  const [removeActividadId, setRemoveActividadId] = useState<number | null>(
    null
  )

  const selectedParticipantId = useParticipacionesViewStore(
    (s) => s.selectedParticipantId
  )
  const setSelectedParticipantId = useParticipacionesViewStore(
    (s) => s.setSelectedParticipantId
  )
  const setAddExpositorDialogOpen = useParticipacionesViewStore(
    (s) => s.setAddExpositorDialogOpen
  )

  const isOpen = selectedParticipantId !== null
  const participant =
    data.participantes.find((row) => row.key === selectedParticipantId) ?? null
  const expositor: ComposedExposicion | null = participant?.exposicion ?? null
  const actividades: ComposedActividad[] = participant?.actividades ?? []

  const detallesByActividadId = new Map(
    actividades.flatMap((actividad) =>
      actividad.detalle ? [[actividad.id, actividad.detalle] as const] : []
    )
  )

  const detallesById = new Map(
    actividades.flatMap((actividad) =>
      actividad.detalle
        ? [[actividad.detalle.id, actividad.detalle] as const]
        : []
    )
  )

  const isCollective = participant?.participantType === 'agrupacion'
  const isBand = participant?.participantType === 'banda'
  const isVetado = participant?.artistaEstadoSlug === 'vetado'

  // Expositor local state
  const [expositorDirty, setExpositorDirty] = useState(false)
  const [expositorPatch, setExpositorPatch] = useState<{
    disciplinaId?: string
    estado?: ParticipationStatus
    modoIngresoId?: string
    notas?: string
  }>({})
  const [isSavingExpositor, startSavingExpositor] = useTransition()

  // Header info
  const headerName = participant?.displayName ?? 'Participante'

  const handleExpositorFieldChange = (
    field: 'disciplinaId' | 'estado' | 'modoIngresoId' | 'notas',
    value: string | null
  ) => {
    setExpositorPatch((prev) => ({
      ...prev,
      [field]: field === 'notas' ? value : value
    }))
    setExpositorDirty(true)
  }

  const handleSaveExpositor = () => {
    if (!expositor) return

    startSavingExpositor(async () => {
      const result = await updateExpositorAction({
        expositorId: String(expositor.id),
        edicionId: String(expositor.edicionId),
        ...expositorPatch
      })

      if (result.success) {
        setExpositorDirty(false)
        setExpositorPatch({})
        toast.success('Cambios guardados')
      } else {
        toast.error(result.errors?.[0]?.message ?? 'Error al guardar')
      }
    })
  }

  // Actividad local state per actividad
  const [actividadPatches, setActividadPatches] = useState<
    Record<
      number,
      {
        tipoActividadId?: string
        estado?: ParticipationStatus
        modoIngresoId?: string
        notas?: string
      }
    >
  >({})
  const [detallesPatches, setDetallesPatches] = useState<
    Record<
      number,
      {
        titulo?: string | null
        descripcion?: string | null
        duracionMinutos?: number | null
        cupos?: number | null
        horaInicio?: string | null
        ubicacion?: string | null
      }
    >
  >({})
  const [savingActividadIds, setSavingActividadIds] = useState<Set<number>>(
    new Set()
  )
  const [savingDetallesIds, setSavingDetallesIds] = useState<Set<number>>(
    new Set()
  )

  const handleActividadFieldChange = (
    actividadId: number,
    field: 'tipoActividadId' | 'estado' | 'modoIngresoId' | 'notas',
    value: string | null
  ) => {
    setActividadPatches((prev) => ({
      ...prev,
      [actividadId]: {
        ...prev[actividadId],
        [field]: field === 'notas' ? value : value
      }
    }))
  }

  const handleSaveActividad = (actividadId: number) => {
    const actividad = actividades.find((a) => a.id === actividadId)
    if (!actividad) return

    const patch = actividadPatches[actividadId]
    if (!patch) return

    setSavingActividadIds((prev) => new Set(prev).add(actividadId))

    startSavingActividad(async () => {
      const result = await updateActividadAction({
        actividadId: String(actividadId),
        edicionId: String(actividad.edicionId),
        ...patch
      })

      if (result.success) {
        setActividadPatches((prev) => {
          const next = { ...prev }
          delete next[actividadId]
          return next
        })
        toast.success('Cambios guardados')
      } else {
        toast.error(result.errors?.[0]?.message ?? 'Error al guardar')
      }

      setSavingActividadIds((prev) => {
        const next = new Set(prev)
        next.delete(actividadId)
        return next
      })
    })
  }

  const [, startSavingActividad] = useTransition()

  const handleDetallesFieldChange = (
    detallesId: number,
    field:
      | 'titulo'
      | 'descripcion'
      | 'duracionMinutos'
      | 'cupos'
      | 'horaInicio'
      | 'ubicacion',
    value: string | number | null
  ) => {
    setDetallesPatches((prev) => ({
      ...prev,
      [detallesId]: {
        ...prev[detallesId],
        [field]: value
      }
    }))
  }

  const handleSaveDetalles = (detallesId: number) => {
    const patch = detallesPatches[detallesId]
    if (!patch) return

    setSavingDetallesIds((prev) => new Set(prev).add(detallesId))

    startSavingDetalles(async () => {
      const result = await updateDetallesAction({
        detallesId: String(detallesId),
        ...patch
      })

      if (result.success) {
        setDetallesPatches((prev) => {
          const next = { ...prev }
          delete next[detallesId]
          return next
        })
        toast.success('Cambios guardados')
      } else {
        toast.error(result.errors?.[0]?.message ?? 'Error al guardar')
      }

      setSavingDetallesIds((prev) => {
        const next = new Set(prev)
        next.delete(detallesId)
        return next
      })
    })
  }

  const [, startSavingDetalles] = useTransition()

  const getExpositorValue = (
    field: 'disciplinaId' | 'estado' | 'modoIngresoId' | 'notas'
  ): string => {
    if (expositorPatch[field] !== undefined) {
      return expositorPatch[field] ?? ''
    }

    if (!expositor) return ''

    if (field === 'notas') {
      return expositor.notas ?? ''
    }

    if (field === 'estado') {
      return expositor.estado
    }

    if (field === 'disciplinaId') {
      return String(expositor.disciplinaId)
    }

    return String(expositor.modoIngresoId)
  }

  const isActividadDirty = (actividadId: number): boolean => {
    return !!actividadPatches[actividadId]
  }

  const isDetallesDirty = (detallesId: number): boolean => {
    return !!detallesPatches[detallesId]
  }

  const getActividadValue = (
    actividadId: number,
    field: 'tipoActividadId' | 'estado' | 'modoIngresoId' | 'notas'
  ): string => {
    const patch = actividadPatches[actividadId]
    if (patch && patch[field] !== undefined) {
      return patch[field] ?? ''
    }

    const actividad = actividades.find((a) => a.id === actividadId)
    if (!actividad) return ''

    if (field === 'notas') {
      return actividad.notas ?? ''
    }

    if (field === 'estado') {
      return actividad.estado
    }

    if (field === 'tipoActividadId') {
      return String(actividad.tipoActividadId)
    }

    return String(actividad.modoIngresoId)
  }

  const getDetallesValue = (
    detallesId: number,
    field:
      | 'titulo'
      | 'descripcion'
      | 'duracionMinutos'
      | 'cupos'
      | 'horaInicio'
      | 'ubicacion'
  ): string => {
    const patch = detallesPatches[detallesId]
    if (patch && patch[field] !== undefined) {
      if (field === 'duracionMinutos' || field === 'cupos') {
        return patch[field]?.toString() ?? ''
      }
      return patch[field] ?? ''
    }

    const detalles = detallesById.get(detallesId)
    if (!detalles) return ''
    const val = detalles[field]
    if (val === null || val === undefined) return ''
    return val.toString()
  }

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => !open && setSelectedParticipantId(null)}
      >
        <SheetContent
          side='right'
          className='flex w-110 flex-col overflow-y-auto sm:max-w-110'
        >
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              {headerName}
              {isVetado && (
                <Badge variant='destructive' className='text-[10px]'>
                  Vetado
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              {isBand
                ? 'Banda'
                : isCollective
                  ? 'Agrupación'
                  : 'Artista individual'}
            </SheetDescription>
          </SheetHeader>

          <div className='flex flex-1 flex-col gap-6 py-6'>
            {/* EXPOSICIÓN SECTION */}
            <section>
              <h3 className='text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase'>
                Exposición
              </h3>

              {isBand ? (
                <div className='flex flex-col gap-2'>
                  <p className='text-muted-foreground text-sm'>
                    Las bandas no pueden participar como expositoras.
                  </p>
                </div>
              ) : expositor ? (
                <div className='flex flex-col gap-4'>
                  {/* Disciplina */}
                  <div className='flex flex-col gap-1.5'>
                    <Label>Disciplina</Label>
                    <Select
                      value={getExpositorValue('disciplinaId')}
                      onValueChange={(val) =>
                        !isVetado &&
                        val &&
                        handleExpositorFieldChange('disciplinaId', val)
                      }
                      disabled={isVetado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar disciplina' />
                      </SelectTrigger>
                      <SelectContent>
                        {data.disciplinas.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estado */}
                  <div className='flex flex-col gap-1.5'>
                    <Label>Estado</Label>
                    <Select
                      value={getExpositorValue('estado')}
                      onValueChange={(val) =>
                        !isVetado && handleExpositorFieldChange('estado', val)
                      }
                      disabled={isVetado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar estado' />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADO_OPCIONES.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Modo Ingreso */}
                  <div className='flex flex-col gap-1.5'>
                    <Label>Modo de ingreso</Label>
                    <Select
                      value={getExpositorValue('modoIngresoId')}
                      onValueChange={(val) =>
                        !isVetado &&
                        val &&
                        handleExpositorFieldChange('modoIngresoId', val)
                      }
                      disabled={isVetado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar modo' />
                      </SelectTrigger>
                      <SelectContent>
                        {data.modosIngreso.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Puntaje (read-only) */}
                  <div className='flex flex-col gap-1.5'>
                    <Label>Puntaje</Label>
                    <p className='text-muted-foreground text-sm'>
                      {expositor.puntaje ?? '—'}
                    </p>
                  </div>

                  {/* Notas */}
                  <div className='flex flex-col gap-1.5'>
                    <Label>Notas</Label>
                    <Textarea
                      value={getExpositorValue('notas')}
                      disabled={isVetado}
                      onChange={(e) =>
                        !isVetado &&
                        handleExpositorFieldChange('notas', e.target.value)
                      }
                      rows={2}
                      placeholder={
                        isVetado
                          ? 'Artista vetado — campos deshabilitados'
                          : 'Notas...'
                      }
                    />
                  </div>

                  {/* Save button */}
                  <Button
                    onClick={handleSaveExpositor}
                    disabled={!expositorDirty || isSavingExpositor || isVetado}
                  >
                    {isSavingExpositor ? 'Guardando...' : 'Guardar'}
                  </Button>

                  {/* Remove button */}
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setRemoveExpositorOpen(true)}
                    disabled={isVetado}
                  >
                    <IconTrash className='mr-2 h-4 w-4' />
                    Quitar como expositor
                  </Button>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  <p className='text-muted-foreground text-sm'>
                    No tiene exposición
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setSelectedParticipantId(null)
                      setAddExpositorDialogOpen(true)
                    }}
                    disabled={isBand}
                  >
                    + Agregar como expositor
                  </Button>
                </div>
              )}
            </section>

            {/* ACTIVIDADES SECTION */}
            <section>
              <h3 className='text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase'>
                Actividades
              </h3>

              {actividades.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No tiene actividades
                </p>
              ) : (
                <div className='flex flex-col gap-3'>
                  {actividades.map((activ) => {
                    const det = detallesByActividadId.get(activ.id)
                    const isDirty = isActividadDirty(activ.id)
                    const isSavingAct = savingActividadIds.has(activ.id)

                    return (
                      <div
                        key={activ.id}
                        className='flex flex-col gap-3 rounded-md border p-3'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            {activ.tipoActividadSlug ?? 'Actividad'}
                          </span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-destructive h-7 w-7'
                            onClick={() => setRemoveActividadId(activ.id)}
                          >
                            <IconTrash className='h-4 w-4' />
                          </Button>
                        </div>

                        {/* Tipo */}
                        <div className='flex flex-col gap-1.5'>
                          <Label>Tipo</Label>
                          <Select
                            value={getActividadValue(
                              activ.id,
                              'tipoActividadId'
                            )}
                            onValueChange={(val) =>
                              val &&
                              handleActividadFieldChange(
                                activ.id,
                                'tipoActividadId',
                                val
                              )
                            }
                            disabled={activ.bandaId !== null}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Tipo de actividad' />
                            </SelectTrigger>
                            <SelectContent>
                              {data.tiposActividad.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                  {t.slug}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {activ.bandaId !== null && (
                            <p className='text-muted-foreground text-xs'>
                              Las bandas solo pueden participar en actividades de música.
                            </p>
                          )}
                        </div>

                        {/* Estado */}
                        <div className='flex flex-col gap-1.5'>
                          <Label>Estado</Label>
                          <Select
                            value={getActividadValue(activ.id, 'estado')}
                            onValueChange={(val) =>
                              handleActividadFieldChange(
                                activ.id,
                                'estado',
                                val
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ESTADO_OPCIONES.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Modo Ingreso */}
                        <div className='flex flex-col gap-1.5'>
                          <Label>Modo de ingreso</Label>
                          <Select
                            value={getActividadValue(activ.id, 'modoIngresoId')}
                            onValueChange={(val) =>
                              val &&
                              handleActividadFieldChange(
                                activ.id,
                                'modoIngresoId',
                                val
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {data.modosIngreso.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                  {m.slug}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notas */}
                        <div className='flex flex-col gap-1.5'>
                          <Label>Notas</Label>
                          <Textarea
                            value={getActividadValue(activ.id, 'notas')}
                            onChange={(e) =>
                              handleActividadFieldChange(
                                activ.id,
                                'notas',
                                e.target.value
                              )
                            }
                            rows={2}
                            placeholder='Notas...'
                          />
                        </div>

                        {/* Save button for actividad */}
                        <Button
                          onClick={() => handleSaveActividad(activ.id)}
                          disabled={!isDirty || isSavingAct}
                          size='sm'
                        >
                          {isSavingAct ? 'Guardando...' : 'Guardar'}
                        </Button>

                        {/* Detalles accordion */}
                        {det && (
                          <Accordion>
                            <AccordionItem value='detalles'>
                              <AccordionTrigger className='text-sm'>
                                Detalles
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className='flex flex-col gap-3 pt-2'>
                                  <div className='flex flex-col gap-1.5'>
                                    <Label>Título</Label>
                                    <Input
                                      value={getDetallesValue(det.id, 'titulo')}
                                      onChange={(e) =>
                                        handleDetallesFieldChange(
                                          det.id,
                                          'titulo',
                                          e.target.value
                                        )
                                      }
                                      placeholder='Título de la actividad'
                                    />
                                  </div>
                                  <div className='flex flex-col gap-1.5'>
                                    <Label>Descripción</Label>
                                    <Textarea
                                      value={getDetallesValue(
                                        det.id,
                                        'descripcion'
                                      )}
                                      onChange={(e) =>
                                        handleDetallesFieldChange(
                                          det.id,
                                          'descripcion',
                                          e.target.value
                                        )
                                      }
                                      rows={2}
                                    />
                                  </div>
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div className='flex flex-col gap-1.5'>
                                      <Label>Duración (min)</Label>
                                      <Input
                                        type='number'
                                        value={getDetallesValue(
                                          det.id,
                                          'duracionMinutos'
                                        )}
                                        onChange={(e) =>
                                          handleDetallesFieldChange(
                                            det.id,
                                            'duracionMinutos',
                                            e.target.value
                                              ? Number(e.target.value)
                                              : null
                                          )
                                        }
                                      />
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                      <Label>Cupos</Label>
                                      <Input
                                        type='number'
                                        value={getDetallesValue(
                                          det.id,
                                          'cupos'
                                        )}
                                        onChange={(e) =>
                                          handleDetallesFieldChange(
                                            det.id,
                                            'cupos',
                                            e.target.value
                                              ? Number(e.target.value)
                                              : null
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className='flex flex-col gap-1.5'>
                                    <Label>Hora de inicio</Label>
                                    <Input
                                      type='time'
                                      value={getDetallesValue(
                                        det.id,
                                        'horaInicio'
                                      )}
                                      onChange={(e) =>
                                        handleDetallesFieldChange(
                                          det.id,
                                          'horaInicio',
                                          e.target.value || null
                                        )
                                      }
                                    />
                                  </div>
                                  <div className='flex flex-col gap-1.5'>
                                    <Label>Ubicación</Label>
                                    <Input
                                      value={getDetallesValue(
                                        det.id,
                                        'ubicacion'
                                      )}
                                      onChange={(e) =>
                                        handleDetallesFieldChange(
                                          det.id,
                                          'ubicacion',
                                          e.target.value || null
                                        )
                                      }
                                      placeholder='Sala, espacio...'
                                    />
                                  </div>

                                  {/* Save button for detalles */}
                                  <Button
                                    onClick={() => handleSaveDetalles(det.id)}
                                    disabled={
                                      !isDetallesDirty(det.id) ||
                                      savingDetallesIds.has(det.id)
                                    }
                                    size='sm'
                                  >
                                    {savingDetallesIds.has(det.id)
                                      ? 'Guardando...'
                                      : 'Guardar detalles'}
                                  </Button>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <SheetFooter>
            <Button
              variant='outline'
              onClick={() => setSelectedParticipantId(null)}
            >
              Cerrar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Remove expositor alert */}
      <AlertDialog
        open={removeExpositorOpen}
        onOpenChange={setRemoveExpositorOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar como expositor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la participación de exposición.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRemoveExpositorOpen(false)
              }}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove actividad alert */}
      <AlertDialog
        open={removeActividadId !== null}
        onOpenChange={(open) => !open && setRemoveActividadId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la actividad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRemoveActividadId(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

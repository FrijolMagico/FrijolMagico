'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/ui/badge'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { UPDATE_AGRUPACION_FORM_ID } from '../_constants'
import { addMemberAction } from '../_actions/add-member.action'
import { getAvailableArtistsAction } from '../_actions/get-available-artists.action'
import { getMembersAction } from '../_actions/get-members.action'
import { removeMemberAction } from '../_actions/remove-member.action'
import { updateAgrupacionAction } from '../_actions/update-agrupacion.action'
import { updateMemberAction } from '../_actions/update-member.action'
import {
  agrupacionFormSchema,
  type AgrupacionFormInput
} from '../_schemas/agrupacion.schema'
import { useAgrupacionDialogStore } from '../_store/agrupacion-dialog-store'
import type {
  ArtistLookup,
  CollectiveMember,
  PendingMember
} from '../_types/agrupacion'
import { AddMemberCombobox } from './add-member-combobox'
import { AgrupacionFormLayout } from './agrupacion-form-layout'
import { MemberList } from './member-list'

function toNullableString(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getDefaultValues(
  selectedAgrupacion: ReturnType<
    typeof useAgrupacionDialogStore.getState
  >['selectedAgrupacion']
): AgrupacionFormInput {
  return {
    nombre: selectedAgrupacion?.nombre ?? '',
    descripcion: selectedAgrupacion?.descripcion ?? '',
    correo: selectedAgrupacion?.correo ?? '',
    activo: selectedAgrupacion?.activo ?? true
  }
}

export function AgrupacionDetailDialog() {
  const isDetailOpen = useAgrupacionDialogStore((state) => state.isDetailOpen)
  const selectedAgrupacion = useAgrupacionDialogStore(
    (state) => state.selectedAgrupacion
  )
  const closeDetailDialog = useAgrupacionDialogStore(
    (state) => state.closeDetailDialog
  )

  const [members, setMembers] = useState<CollectiveMember[]>([])
  const [initialMemberIds, setInitialMemberIds] = useState<number[]>([])
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [removedMemberIds, setRemovedMemberIds] = useState<number[]>([])
  const [availableArtists, setAvailableArtists] = useState<ArtistLookup[]>([])
  const [hasMemberChanges, setHasMemberChanges] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  const methods = useForm<AgrupacionFormInput>({
    resolver: zodResolver(agrupacionFormSchema),
    values: getDefaultValues(selectedAgrupacion),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  useEffect(() => {
    if (!isDetailOpen || !selectedAgrupacion) {
      setMembers([])
      setInitialMemberIds([])
      setPendingMembers([])
      setRemovedMemberIds([])
      setAvailableArtists([])
      setHasMemberChanges(false)
      return
    }

    let isMounted = true
    const agrupacionId = selectedAgrupacion.id

    async function loadDialogData() {
      setIsLoadingMembers(true)

      try {
        const [membersResult, artistsResult] = await Promise.all([
          getMembersAction(agrupacionId),
          getAvailableArtistsAction(agrupacionId)
        ])

        if (!isMounted) {
          return
        }

        setMembers(membersResult)
        setInitialMemberIds(membersResult.map((member) => member.artistaId))
        setRemovedMemberIds([])
        setAvailableArtists(artistsResult)
        setHasMemberChanges(false)
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los miembros'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingMembers(false)
        }
      }
    }

    void loadDialogData()

    return () => {
      isMounted = false
    }
  }, [isDetailOpen, selectedAgrupacion])

  const totalMemberCount =
    members.filter((member) => member.activo).length +
    pendingMembers.filter((member) => member.activo).length

  if (!selectedAgrupacion) {
    return null
  }

  const syncAvailableArtists = (
    nextMembers: CollectiveMember[],
    nextPending: PendingMember[]
  ) => {
    const selectedIds = new Set([
      ...nextMembers
        .filter((member) => member.activo)
        .map((member) => member.artistaId),
      ...nextPending
        .filter((member) => member.activo)
        .map((member) => member.artistaId)
    ])

    setAvailableArtists((currentArtists) =>
      currentArtists.filter((artist) => !selectedIds.has(artist.id))
    )
  }

  const handleAddPendingMember = (artist: ArtistLookup) => {
    setHasMemberChanges(true)
    setRemovedMemberIds((currentIds) =>
      currentIds.filter((memberId) => memberId !== artist.id)
    )

    const nextPendingMember: PendingMember = {
      artistaId: artist.id,
      pseudonimo: artist.pseudonimo,
      ciudad: artist.ciudad,
      rol: '',
      activo: true
    }

    setPendingMembers((currentMembers) => {
      const nextMembers = [...currentMembers, nextPendingMember]
      syncAvailableArtists(members, nextMembers)
      return nextMembers
    })
  }

  const handleUpdateRol = (artistaId: number, rol: string) => {
    setHasMemberChanges(true)

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.artistaId === artistaId ? { ...member, rol } : member
      )
    )
    setPendingMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.artistaId === artistaId ? { ...member, rol } : member
      )
    )
  }

  const handleToggleActivo = (artistaId: number, activo: boolean) => {
    setHasMemberChanges(true)

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.artistaId === artistaId ? { ...member, activo } : member
      )
    )
    setPendingMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.artistaId === artistaId ? { ...member, activo } : member
      )
    )
  }

  const handleRemoveMember = (artistaId: number) => {
    const removedExistingMember = members.find(
      (member) => member.artistaId === artistaId
    )
    const removedPendingMember = pendingMembers.find(
      (member) => member.artistaId === artistaId
    )

    if (!removedExistingMember && !removedPendingMember) {
      return
    }

    setHasMemberChanges(true)

    if (initialMemberIds.includes(artistaId)) {
      setRemovedMemberIds((currentIds) =>
        currentIds.includes(artistaId) ? currentIds : [...currentIds, artistaId]
      )
    }

    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.artistaId !== artistaId)
    )
    setPendingMembers((currentMembers) =>
      currentMembers.filter((member) => member.artistaId !== artistaId)
    )

    const removedLabel = removedExistingMember
      ? removedExistingMember.artistPseudonimo
      : removedPendingMember?.pseudonimo

    if (removedLabel) {
      setAvailableArtists((currentArtists) => {
        const nextArtist = {
          id: artistaId,
          pseudonimo: removedLabel,
          ciudad:
            removedExistingMember?.artistCiudad ??
            removedPendingMember?.ciudad ??
            null
        }

        const nextArtists = currentArtists.some(
          (artist) => artist.id === nextArtist.id
        )
          ? currentArtists
          : [...currentArtists, nextArtist]

        return nextArtists.sort((left, right) =>
          left.pseudonimo.localeCompare(right.pseudonimo)
        )
      })
    }
  }

  const onSubmit = async (data: AgrupacionFormInput) => {
    const updateResult = await updateAgrupacionAction(
      { success: false },
      {
        id: selectedAgrupacion.id,
        nombre: data.nombre.trim(),
        descripcion: toNullableString(data.descripcion),
        correo: toNullableString(data.correo),
        activo: data.activo
      }
    )

    if (!updateResult.success) {
      toast.error(
        updateResult.errors?.map((error) => error.message).join(', ') ??
          'No se pudo actualizar la agrupación'
      )
      return
    }

    for (const artistaId of removedMemberIds) {
      const result = await removeMemberAction(
        { success: false },
        {
          agrupacionId: selectedAgrupacion.id,
          artistaId
        }
      )

      if (!result.success) {
        toast.error(
          result.errors?.map((error) => error.message).join(', ') ??
            'No se pudieron guardar los miembros'
        )
        return
      }
    }

    for (const member of members) {
      const result = member.activo
        ? await updateMemberAction(
            { success: false },
            {
              agrupacionId: selectedAgrupacion.id,
              artistaId: member.artistaId,
              rol: member.rol,
              activo: member.activo
            }
          )
        : await removeMemberAction(
            { success: false },
            {
              agrupacionId: selectedAgrupacion.id,
              artistaId: member.artistaId
            }
          )

      if (!result.success) {
        toast.error(
          result.errors?.map((error) => error.message).join(', ') ??
            'No se pudieron guardar los miembros'
        )
        return
      }
    }

    for (const member of pendingMembers) {
      if (!member.activo) {
        continue
      }

      const result = await addMemberAction(
        { success: false },
        {
          agrupacionId: selectedAgrupacion.id,
          artistaId: member.artistaId,
          rol: toNullableString(member.rol),
          activo: true
        }
      )

      if (!result.success) {
        toast.error(
          result.errors?.map((error) => error.message).join(', ') ??
            'No se pudo agregar un miembro'
        )
        return
      }
    }

    toast.success('Agrupación actualizada correctamente')
    methods.reset(getDefaultValues(selectedAgrupacion))
    setPendingMembers([])
    setRemovedMemberIds([])
    setHasMemberChanges(false)
    closeDetailDialog()
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            methods.reset(getDefaultValues(selectedAgrupacion))
            setPendingMembers([])
            setRemovedMemberIds([])
            setHasMemberChanges(false)
            closeDetailDialog()
          }
        }}
        title='Detalle de agrupación'
        description='Editá la información general y administrá sus miembros.'
        isDirty={isDirty || hasMemberChanges}
        className='sm:max-w-4xl'
        submit={{
          form: UPDATE_AGRUPACION_FORM_ID,
          disabled: isSubmitting || (!isDirty && !hasMemberChanges) || !isValid,
          isSubmitting,
          label: 'Guardar cambios'
        }}
      >
        <form
          id={UPDATE_AGRUPACION_FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <section className='space-y-3'>
            <div>
              <h3 className='font-semibold'>Información general</h3>
              <p className='text-muted-foreground text-sm'>
                Actualizá los datos básicos de la agrupación.
              </p>
            </div>
            <AgrupacionFormLayout />
          </section>

          <section className='space-y-4 border-t pt-6'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h3 className='font-semibold'>Miembros</h3>
                <p className='text-muted-foreground text-sm'>
                  Agregá artistas y definí su rol dentro de la agrupación.
                </p>
              </div>
              <Badge variant='outline'>{totalMemberCount} miembros</Badge>
            </div>

            <AddMemberCombobox
              artists={availableArtists}
              onAdd={handleAddPendingMember}
            />

            {isLoadingMembers ? (
              <p className='text-muted-foreground text-sm'>
                Cargando miembros...
              </p>
            ) : (
              <MemberList
                members={members}
                pendingMembers={pendingMembers}
                onUpdateRol={handleUpdateRol}
                onToggleActivo={handleToggleActivo}
                onRemove={handleRemoveMember}
              />
            )}
          </section>
        </form>
      </EntityFormDialog>
    </FormProvider>
  )
}

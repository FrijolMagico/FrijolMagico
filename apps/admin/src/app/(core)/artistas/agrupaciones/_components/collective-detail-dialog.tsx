'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { useShallow } from 'zustand/react/shallow'
import { IconUsersPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { UPDATE_COLLECTIVE_FORM_ID } from '../_constants'
import { upsertCollectiveWithMembersAction } from '../_actions/upsert-collective-with-members.action'
import {
  collectiveFormSchema,
  type CollectiveFormInput,
  type MemberDraftItemInput
} from '../_schemas/collective.schema'
import { useCollectiveDraftStore } from '../_store/use-collective-draft-store'
import { useCollectiveStore } from '../_store/use-collective-store'
import type {
  ArtistOption,
  CollectiveRow,
  MemberDraftItem,
  MembersByCollectiveId
} from '../_types/collective.types'
import { CollectiveFormLayout } from './collective-form-layout'
import { CollectiveMemberList } from './collective-member-list'
import { MemberCreateDialog } from './member-create-dialog'
import { MemberUpdateDialog } from './member-update-dialog'

interface CollectiveDetailDialogProps {
  membersByCollectiveId: MembersByCollectiveId
  availableArtists: ArtistOption[] | null
}

function getDefaultValues(
  selectedCollective: CollectiveRow | null
): CollectiveFormInput {
  return {
    nombre: selectedCollective?.nombre ?? '',
    descripcion: selectedCollective?.descripcion ?? '',
    correo: selectedCollective?.correo ?? '',
    activo: selectedCollective?.activo ?? true
  }
}

function mapMemberToPayload(member: MemberDraftItem): MemberDraftItemInput {
  return {
    artistId: member.artistId,
    role: member.role,
    active: member.active
  }
}

function getPendingRemovals(
  originalMembers: MemberDraftItem[],
  existingMembers: MemberDraftItem[]
) {
  return originalMembers
    .filter(
      (originalMember) =>
        !existingMembers.some(
          (existingMember) =>
            existingMember.artistId === originalMember.artistId
        )
    )
    .map((member) => member.artistId)
}

function getPendingUpdates(
  originalMembers: MemberDraftItem[],
  existingMembers: MemberDraftItem[]
) {
  return existingMembers
    .filter((currentMember) => {
      const originalMember = originalMembers.find(
        (member) => member.artistId === currentMember.artistId
      )

      return Boolean(
        originalMember &&
        (originalMember.role !== currentMember.role ||
          originalMember.active !== currentMember.active)
      )
    })
    .map(mapMemberToPayload)
}

export function CollectiveDetailDialog({
  membersByCollectiveId,
  availableArtists
}: CollectiveDetailDialogProps) {
  const isUpdateCollectiveOpen = useCollectiveStore(
    (state) => state.isUpdateCollectiveOpen
  )
  const selectedCollective = useCollectiveStore(
    (state) => state.selectedCollective
  )
  const closeUpdateCollectiveDialog = useCollectiveStore(
    (state) => state.closeUpdateCollectiveDialog
  )

  const {
    originalMembers,
    existingMembers,
    pendingAdds,
    initDraft,
    resetDraft,
    openMemberCreate
  } = useCollectiveDraftStore(
    useShallow((state) => ({
      originalMembers: state.originalMembers,
      existingMembers: state.existingMembers,
      pendingAdds: state.pendingAdds,
      initDraft: state.init,
      resetDraft: state.reset,
      openMemberCreate: state.openMemberCreate
    }))
  )

  const methods = useForm<CollectiveFormInput>({
    resolver: zodResolver(collectiveFormSchema),
    defaultValues: getDefaultValues(selectedCollective),
    mode: 'onChange'
  })

  const { isDirty, isSubmitting, isValid } = useFormState({
    control: methods.control
  })

  useEffect(() => {
    if (!isUpdateCollectiveOpen || !selectedCollective) {
      methods.reset(getDefaultValues(null))
      resetDraft()
      return
    }

    methods.reset(getDefaultValues(selectedCollective))
    initDraft(
      membersByCollectiveId[selectedCollective.id] ?? [],
      availableArtists
    )
  }, [
    availableArtists,
    initDraft,
    isUpdateCollectiveOpen,
    membersByCollectiveId,
    methods,
    resetDraft,
    selectedCollective
  ])

  if (!selectedCollective) {
    return null
  }

  const pendingRemovals = getPendingRemovals(originalMembers, existingMembers)
  const pendingUpdates = getPendingUpdates(originalMembers, existingMembers)
  const hasDraftChanges =
    pendingAdds.length > 0 ||
    pendingUpdates.length > 0 ||
    pendingRemovals.length > 0

  const closeDialog = () => {
    methods.reset(getDefaultValues(null))
    resetDraft()
    closeUpdateCollectiveDialog()
  }

  const onSubmit = async (data: CollectiveFormInput) => {
    if (!selectedCollective) {
      return
    }

    if (!isDirty && !hasDraftChanges) {
      closeDialog()
      return
    }

    const result = await upsertCollectiveWithMembersAction(
      { success: false },
      {
        collectiveId: selectedCollective.id,
        fields: {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion,
          correo: data.correo,
          activo: data.activo
        },
        pendingAdds: pendingAdds.map(mapMemberToPayload),
        pendingUpdates,
        pendingRemovals
      }
    )

    if (!result.success) {
      toast.error(
        result.errors?.map((error) => error.message).join(', ') ??
          'No se pudieron guardar los cambios de la agrupación'
      )
      return
    }

    toast.success('Agrupación actualizada correctamente')
    closeDialog()
  }

  return (
    <FormProvider {...methods}>
      <EntityFormDialog
        open={isUpdateCollectiveOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog()
          }
        }}
        title='Detalle de agrupación'
        description='Editá la información general y administrá sus miembros en un solo lugar.'
        isDirty={isDirty || hasDraftChanges}
        className='sm:max-w-4xl'
        submit={{
          form: UPDATE_COLLECTIVE_FORM_ID,
          disabled: isSubmitting || (!isDirty && !hasDraftChanges) || !isValid,
          isSubmitting,
          label: 'Guardar cambios'
        }}
      >
        <form
          id={UPDATE_COLLECTIVE_FORM_ID}
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
            <CollectiveFormLayout />
          </section>

          <section className='space-y-4 border-t pt-6'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h3 className='font-semibold'>Miembros</h3>
                <p className='text-muted-foreground text-sm'>
                  Sumá artistas, ajustá sus roles y revisá los cambios
                  pendientes antes de guardar.
                </p>
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='outline'>
                  {existingMembers.length + pendingAdds.length} miembros
                  visibles
                </Badge>
                <Button
                  type='button'
                  variant='outline'
                  onClick={openMemberCreate}
                >
                  <IconUsersPlus />
                  Agregar miembro
                </Button>
              </div>
            </div>

            <CollectiveMemberList />
          </section>
        </form>

        <MemberCreateDialog />
        <MemberUpdateDialog />
      </EntityFormDialog>
    </FormProvider>
  )
}

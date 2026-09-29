'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { ControllerSwitch } from '@/shared/components/controller-switch'
import { EntityFormDialog } from '@/shared/components/entity-form/entity-form-dialog'
import { Field, FieldLabel } from '@/shared/components/ui/field'

import { useCollectiveDraftStore } from '../_store/use-collective-draft-store'
import { getMemberPseudonymsAction } from '../_actions/get-member-pseudonyms.action'
import type { MemberPseudonymOption } from '../_actions/get-member-pseudonyms.action'

const memberUpdateFormSchema = z.object({
  pseudonymId: z.number().int().positive(),
  role: z.string(),
  active: z.boolean()
})

type MemberUpdateFormInput = z.infer<typeof memberUpdateFormSchema>

export function MemberUpdateDialog() {
  const [pseudonyms, setPseudonyms] = useState<MemberPseudonymOption[]>([])
  const [pseudonymArtistId, setPseudonymArtistId] = useState<number | null>(null)
  const [isLoadingPseudonyms, setIsLoadingPseudonyms] = useState(false)
  const pseudonymRequestId = useRef(0)
  const member = useCollectiveDraftStore((state) => state.memberBeingEdited)
  const closeMemberUpdate = useCollectiveDraftStore(
    (state) => state.closeMemberUpdate
  )
  const updateMember = useCollectiveDraftStore((state) => state.updateMember)

  const methods = useForm<MemberUpdateFormInput>({
    resolver: zodResolver(memberUpdateFormSchema),
    values: {
      pseudonymId: member?.pseudonymId ?? 0,
      role: member?.role ?? '',
      active: member?.active ?? true
    },
    mode: 'onChange'
  })

  const loadPseudonyms = async (requestedMember: NonNullable<typeof member>) => {
    const requestId = ++pseudonymRequestId.current
    const { artistId } = requestedMember
    setPseudonymArtistId(null)
    setIsLoadingPseudonyms(true)
    try {
      const options = await getMemberPseudonymsAction(artistId)
      const currentMember = useCollectiveDraftStore.getState().memberBeingEdited
      if (
        requestId !== pseudonymRequestId.current ||
        currentMember !== requestedMember
      ) {
        return
      }

      setPseudonyms(options)
      setPseudonymArtistId(artistId)
      const currentPseudonymId = methods.getValues('pseudonymId')
      if (!options.some((option) => option.id === currentPseudonymId)) {
        methods.setValue(
          'pseudonymId',
          options.find((option) => option.isPrimary)?.id ?? 0,
          { shouldDirty: false, shouldValidate: true }
        )
      }
    } catch (error) {
      if (
        requestId === pseudonymRequestId.current &&
        useCollectiveDraftStore.getState().memberBeingEdited === requestedMember
      ) {
        toast.error(
          error instanceof Error ? error.message : 'No se pudieron cargar los pseudónimos'
        )
      }
    } finally {
      if (requestId === pseudonymRequestId.current) {
        setIsLoadingPseudonyms(false)
      }
    }
  }

  const handleClose = () => {
    pseudonymRequestId.current += 1
    setIsLoadingPseudonyms(false)
    closeMemberUpdate()
  }

  const memberPseudonyms =
    pseudonymArtistId === member?.artistId ? pseudonyms : []
  const selectedPseudonymId = useWatch({
    control: methods.control,
    name: 'pseudonymId'
  })
  const handleSubmit = ({ pseudonymId, role, active }: MemberUpdateFormInput) => {
    if (!member) {
      return
    }

    updateMember(member.artistId, {
      pseudonymId,
      pseudonym:
        memberPseudonyms.find((option) => option.id === pseudonymId)?.pseudonym ??
        member.pseudonym,
      role: role.trim() || null,
      active
    })

    methods.reset()
    closeMemberUpdate()
  }

  return (
    <EntityFormDialog
      open={member !== null}
      onOpenChange={(open) => !open && handleClose()}
      title='Editar miembro'
      description='Ajusta el rol y el estado del integrante seleccionado.'
      submit={{
        label: 'Guardar miembro',
        type: 'button',
        disabled:
          methods.formState.isSubmitting ||
          isLoadingPseudonyms ||
          !memberPseudonyms.some(
            (option) => option.id === selectedPseudonymId
          ),
        isSubmitting: methods.formState.isSubmitting,
        onClick: methods.handleSubmit(handleSubmit)
      }}
    >
      <form className='space-y-4' onSubmit={methods.handleSubmit(handleSubmit)}>
        <Field className='space-y-2'>
          <FieldLabel htmlFor='member-update-pseudonym'>Pseudónimo</FieldLabel>
          {memberPseudonyms.length > 0 ? (
            <select
              id='member-update-pseudonym'
              className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              value={selectedPseudonymId.toString()}
              onChange={(event) =>
                methods.setValue('pseudonymId', Number(event.target.value), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
            >
              {memberPseudonyms.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.pseudonym}{option.isPrimary ? ' (principal)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className='flex items-center justify-between gap-2'>
              <span className='text-muted-foreground text-sm'>
                {member?.pseudonym ?? 'Sin pseudónimo'}
              </span>
              <Button
                type='button'
                variant='outline'
                onClick={() => member && void loadPseudonyms(member)}
                disabled={isLoadingPseudonyms}
              >
                {isLoadingPseudonyms ? 'Cargando...' : 'Cambiar pseudónimo'}
              </Button>
            </div>
          )}
        </Field>

        <Field className='space-y-2'>
          <FieldLabel htmlFor='member-update-role'>Rol</FieldLabel>
          <Input
            id='member-update-role'
            placeholder='Ej. Dirección artística'
            {...methods.register('role')}
          />
        </Field>

        <div className='flex items-center justify-between rounded-lg border p-3'>
          <div>
            <p className='font-medium'>Miembro activo</p>
            <p className='text-muted-foreground text-sm'>
              Definí si el integrante sigue activo dentro de la agrupación.
            </p>
          </div>

          <ControllerSwitch
            name='active'
            control={methods.control}
            label='Estado del miembro'
          />
        </div>
      </form>
    </EntityFormDialog>
  )
}

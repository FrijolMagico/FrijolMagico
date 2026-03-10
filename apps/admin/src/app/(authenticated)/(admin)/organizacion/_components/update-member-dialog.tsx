'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTeamDialog } from '../_store/team-dialog-store'
import { ActionState } from '@/shared/types/actions'
import { updateTeamMember } from '../_actions/team-member.action'
import { useFormFields } from '../_hooks/use-form-fields'
import {
  MemberFormInput,
  memberFormSchema
} from '../_schemas/organizacion.schema'
import { MemberDialog } from './member-dialog'

const FORM_ID = 'team-member-update-form'

export function UpdateMemberDialog() {
  const selectedMember = useTeamDialog((state) => state.selectedMember)
  const closeDialog = useTeamDialog((state) => state.closeDialog)

  const [, formAction, loading] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await updateTeamMember(prevState, formData)

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al actualizar el miembro del equipo'
        )
        return result
      }

      toast.success('Miembro del equipo actualizado correctamente')
      closeDialog()
      return result
    },
    { success: false }
  )

  const { reset, fields, setField, isValid, errors, isDirty } =
    useFormFields<MemberFormInput>(
      {
        name: selectedMember?.name ?? '',
        position: selectedMember?.position ?? '',
        rut: selectedMember?.rut ?? '',
        email: selectedMember?.email ?? '',
        phone: selectedMember?.phone ?? '',
        rrss: selectedMember?.rrss ?? null
      },
      { schema: memberFormSchema }
    )

  useEffect(() => {
    reset({
      name: selectedMember?.name ?? '',
      position: selectedMember?.position ?? '',
      rut: selectedMember?.rut ?? '',
      email: selectedMember?.email ?? '',
      phone: selectedMember?.phone ?? '',
      rrss: selectedMember?.rrss ?? null
    })
  }, [selectedMember]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MemberDialog
      config={{
        fields,
        setField,
        errors,
        isValid,
        isDirty,
        formAction,
        formId: FORM_ID,
        loading
      }}
      ui={{
        title: 'Actualizar información del miembro del equipo'
      }}
    />
  )
}

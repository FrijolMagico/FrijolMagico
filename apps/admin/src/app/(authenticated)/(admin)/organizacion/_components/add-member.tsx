'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useTeamDialog } from '../_store/team-dialog-store'
import { ActionState } from '@/shared/types/actions'
import { addTeamMember } from '../_actions/team-member.action'
import { toast } from 'sonner'
import { useFormFields } from '../_hooks/use-form-fields'
import {
  MemberFormInput,
  memberFormSchema
} from '../_schemas/organizacion.schema'
import { MemberDialog } from './member-dialog'

const FORM_ID = 'team-member-insert-form'

export function AddMember() {
  const openDialog = useTeamDialog((state) => state.openDialog)
  const closeDialog = useTeamDialog((state) => state.closeDialog)

  const { fields, setField, errors, isValid, isDirty, reset } =
    useFormFields<MemberFormInput>(
      {
        name: '',
        position: '',
        rut: '',
        email: '',
        phone: '',
        rrss: null
      },
      { schema: memberFormSchema }
    )

  const [, formAction, loading] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addTeamMember(prevState, formData)

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al añadir al miembro del equipo'
        )
        return result
      }

      toast.success('Miembro del equipo añadido correctamente')
      closeDialog()
      reset()
      return result
    },
    {
      success: false
    }
  )

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
        title: 'Agregar miembro del equipo',
        trigger: (
          <Button variant='outline' onClick={() => openDialog(null)}>
            <IconPlus />
            Agregar miembro
          </Button>
        )
      }}
    />
  )
}

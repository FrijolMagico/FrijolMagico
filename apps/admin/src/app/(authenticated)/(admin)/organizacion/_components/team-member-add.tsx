'use client'

import { useForm, FormProvider, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { addTeamMember } from '../_actions/team-member.action'
import {
  type TeamMemberFormInput,
  teamMemberFormSchema
} from '../_schemas/organizacion.schema'
import { TeamMemberFormFields } from './team-member-form-fields'
import { ADD_TEAM_FORM_ID } from '../_constants'
import { useState } from 'react'

const DEFAULT_VALUES: TeamMemberFormInput = {
  name: '',
  position: null,
  rut: null,
  email: '',
  phone: null,
  rrss: null
}

export function TeamMemberAdd() {
  const [open, setOpen] = useState(false)

  const methods = useForm<TeamMemberFormInput>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange'
  })

  const { isDirty, isValid, isSubmitting } = useFormState({
    control: methods.control
  })

  const onSubmit = async (data: TeamMemberFormInput) => {
    try {
      const result = await addTeamMember({ success: false }, data)

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al añadir al miembro del equipo'
        )
        return
      }

      setOpen(false)
      toast.success('Miembro del equipo añadido correctamente')
    } finally {
      methods.reset()
    }
  }

  return (
    <FormProvider {...methods}>
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogTrigger asChild>
          <Button variant='outline'>
            <IconPlus />
            Agregar miembro
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          {isDirty && (
            <Badge className='absolute -top-2 -left-6 ml-2 -rotate-6'>
              Editado
            </Badge>
          )}
          <DialogHeader>
            <DialogTitle>Agregar miembro del equipo</DialogTitle>
          </DialogHeader>

          <form id={ADD_TEAM_FORM_ID} onSubmit={methods.handleSubmit(onSubmit)}>
            <TeamMemberFormFields />
          </form>

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cerrar
              </Button>
            </DialogClose>
            <Button
              type='submit'
              form={ADD_TEAM_FORM_ID}
              disabled={!isDirty || !isValid || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}

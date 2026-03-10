import type { ReactNode } from 'react'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { RRSSManager } from '@/shared/components/rrss-manager/rrss-manager'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon
} from '@/shared/components/ui/input-group'
import { MemberFormInput } from '../_schemas/organizacion.schema'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useTeamDialog } from '../_store/team-dialog-store'
import { Badge } from '@/shared/components/ui/badge'

type TeamMemberDialogConfig = {
  fields: MemberFormInput
  setField: <K extends keyof MemberFormInput>(
    key: K,
    value: MemberFormInput[K]
  ) => void
  errors: Partial<Record<keyof MemberFormInput, string>>
  formAction: (formData: FormData) => void
  formId: string
  loading: boolean
  isValid: boolean
  isDirty: boolean
}

type TeamMemberDialogUI = {
  title: string
  trigger?: ReactNode
}

interface TeamMemberDialogProps {
  config: TeamMemberDialogConfig
  ui: TeamMemberDialogUI
}

export function MemberDialog({ config, ui }: TeamMemberDialogProps) {
  const isOpen = useTeamDialog((state) => state.isDialogOpen)
  const closeDialog = useTeamDialog((state) => state.closeDialog)

  return (
    <>
      {ui.trigger && ui.trigger}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent>
          {config.isDirty && (
            <Badge className='absolute -top-2 -left-6 ml-2 -rotate-6'>
              Editado
            </Badge>
          )}
          <DialogHeader>
            <DialogTitle>{ui.title}</DialogTitle>
          </DialogHeader>

          <form action={config.formAction} id={config.formId}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='name'>
                  Nombre <span className='text-destructive'>*</span>
                </FieldLabel>
                <Input
                  id='name'
                  name='name'
                  value={config.fields.name}
                  onChange={(e) => config.setField('name', e.target.value)}
                  placeholder='Nombre completo'
                  aria-invalid={!!config.errors.name}
                />
                {config.errors.name && (
                  <FieldError>{config.errors.name}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor='position'>Cargo</FieldLabel>
                <Input
                  id='position'
                  name='position'
                  value={config.fields.position}
                  onChange={(e) => config.setField('position', e.target.value)}
                  placeholder='Ej. Director'
                />
              </Field>

              <div className='grid grid-cols-2 gap-4'>
                <Field>
                  <FieldLabel htmlFor='rut'>RUT</FieldLabel>
                  <Input
                    id='rut'
                    name='rut'
                    value={config.fields.rut}
                    onChange={(e) => config.setField('rut', e.target.value)}
                    placeholder='12.345.678-9'
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='phone'>Teléfono</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id='phone'
                      name='phone'
                      value={config.fields.phone}
                      onChange={(e) => config.setField('phone', e.target.value)}
                      placeholder='912345678'
                    />
                    <InputGroupAddon>+56</InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={config.fields.email}
                  onChange={(e) => config.setField('email', e.target.value)}
                  placeholder='correo@ejemplo.com'
                />
              </Field>

              <RRSSManager
                values={config.fields.rrss}
                onChange={(rrss) => config.setField('rrss', rrss)}
              />

              <input
                type='hidden'
                name='rrss'
                value={JSON.stringify(config.fields.rrss ?? {})}
              />
            </FieldGroup>
          </form>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' onClick={() => closeDialog()}>
                Cerrar
              </Button>
            </DialogClose>
            <Button
              type='submit'
              form={config.formId}
              disabled={!config.isDirty || !config.isValid || config.loading}
            >
              {config.loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

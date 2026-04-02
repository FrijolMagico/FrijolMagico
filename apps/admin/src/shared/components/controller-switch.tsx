import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

interface ControllerSwitchProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
}

export function ControllerSwitch<T extends FieldValues>({
  name,
  control,
  label
}: ControllerSwitchProps<T>) {
  return (
    <div className='flex items-center gap-2'>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        )}
      />
      <Label>{label}</Label>
    </div>
  )
}

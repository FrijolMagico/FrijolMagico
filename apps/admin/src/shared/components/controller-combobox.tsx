import { Field, FieldLabel } from './ui/field'
import {
  Controller,
  type Control,
  type FieldValues,
  type Path
} from 'react-hook-form'
import {
  ComboboxContent,
  Combobox,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem
} from './ui/combobox'

interface ControllerComboboxProps<T extends FieldValues> {
  label?: string
  emptyText?: string
  placeholder?: string
  name: Path<T>
  items: { value: number; label: string }[]
  control: Control<T>
}

export function ControllerCombobox<T extends FieldValues>({
  label,
  emptyText,
  placeholder,
  name,
  items,
  control
}: ControllerComboboxProps<T>) {
  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          const selectedItem = items.find((item) => item.value === value)

          return (
            <Combobox
              items={items}
              value={selectedItem ?? null}
              onValueChange={(val) => {
                onChange(val?.value ?? 0)
              }}
              itemToStringLabel={(item) => item?.label ?? ''}
            >
              <ComboboxInput
                placeholder={placeholder ?? 'Selecciona una opción'}
                showTrigger
                showClear
              />
              <ComboboxContent className='pointer-events-auto!'>
                {emptyText && <ComboboxEmpty>{emptyText}</ComboboxEmpty>}
                <ComboboxList>
                  {(item: (typeof items)[0]) => (
                    <ComboboxItem key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )
        }}
      />
    </Field>
  )
}

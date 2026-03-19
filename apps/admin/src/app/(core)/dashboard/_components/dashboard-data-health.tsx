import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import type { DataCompleteness } from '../_types'
import { Field, FieldLabel } from '@/shared/components/ui/field'

type Props = {
  completeness: DataCompleteness
}

function pct(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function DashboardDataHealth({ completeness }: Props) {
  const rows = [
    { label: 'Nombre', value: pct(completeness.withName, completeness.total) },
    { label: 'Correo', value: pct(completeness.withEmail, completeness.total) },
    {
      label: 'Teléfono',
      value: pct(completeness.withPhone, completeness.total)
    },
    { label: 'RUT', value: pct(completeness.withRut, completeness.total) }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la información de Artistas</CardTitle>
        <CardDescription>
          *El valor más importante es el RUT, con él podemos identificar a los
          artistas de manera única y evitar duplicados.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {rows.map((row) => (
          <Field key={row.label} className='w-full max-w-sm'>
            <FieldLabel htmlFor={row.label}>
              <span>{row.label}</span>
              <span className='ml-auto'>{row.value}%</span>
            </FieldLabel>
            <Progress value={row.value} />
          </Field>
        ))}
      </CardContent>
    </Card>
  )
}

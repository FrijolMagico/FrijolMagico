import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Progress } from '@/shared/components/ui/progress'
import type { DataCompleteness } from '../_types'

type Props = {
  completeness: DataCompleteness | null
}

function pct(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export function DashboardDataHealth({ completeness }: Props) {
  if (!completeness) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salud de la Base de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>Sin datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const rows = [
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
        <CardTitle>Salud de la Base de Datos</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {rows.map((row) => (
          <div key={row.label} className='space-y-1'>
            <div className='flex items-center justify-between text-sm'>
              <span>{row.label}</span>
              <span className='text-muted-foreground'>{row.value}%</span>
            </div>
            <Progress value={row.value} className='h-2' />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

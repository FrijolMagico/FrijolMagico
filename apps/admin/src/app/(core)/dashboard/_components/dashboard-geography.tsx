import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import { Progress } from '@/shared/components/ui/progress'

import type { CityPoint } from '../_types'

type Props = {
  data: CityPoint[]
}

export function DashboardGeography({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Origen Geográfico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Sin datos de ubicación
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <Card className='col-span-4'>
      <CardHeader>
        <CardTitle>Origen Geográfico</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {data.map((city) => (
          <Field key={city.ciudad}>
            <FieldLabel className='flex items-center justify-between'>
              <span>{city.ciudad}</span>
              <span className='text-muted-foreground'>{city.count}</span>
            </FieldLabel>
            <Progress
              value={maxCount > 0 ? (city.count / maxCount) * 100 : 0}
            />
          </Field>
        ))}
      </CardContent>
    </Card>
  )
}

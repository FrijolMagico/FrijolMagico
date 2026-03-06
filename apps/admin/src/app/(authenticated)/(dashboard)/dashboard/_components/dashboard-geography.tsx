import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
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
    <Card>
      <CardHeader>
        <CardTitle>Origen Geográfico</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {data.map((city) => {
          const widthPct = maxCount > 0 ? (city.count / maxCount) * 100 : 0

          return (
            <div key={city.ciudad} className='space-y-1'>
              <div className='flex items-center justify-between text-sm'>
                <span>{city.ciudad}</span>
                <span className='text-muted-foreground'>{city.count}</span>
              </div>
              <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                <div
                  className='bg-primary h-full rounded-full transition-all'
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
